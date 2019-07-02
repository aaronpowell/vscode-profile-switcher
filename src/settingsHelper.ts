import * as fs from "fs-extra";
import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { Settings } from "./services/config";

export enum OsType {
  Windows = 1,
  Linux,
  Mac
}

export default class SettingsHelper {
  public isInsiders: boolean = false;
  public isOss: boolean = false;
  public isPortable: boolean = false;
  public homeDir: string | undefined;
  public USER_FOLDER: string;

  public PATH: string = "";
  public OsType: OsType = OsType.Windows;

  public constructor(private context: vscode.ExtensionContext) {
    this.isInsiders = /insiders/.test(this.context.asAbsolutePath(""));
    this.isPortable = process.env.VSCODE_PORTABLE ? true : false;
    this.isOss = /\boss\b/.test(this.context.asAbsolutePath(""));

    const isXdg =
      !this.isInsiders &&
      process.platform === "linux" &&
      !!process.env.XDG_DATA_HOME;
    this.homeDir = isXdg
      ? process.env.XDG_DATA_HOME
      : process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];

    if (!this.isPortable) {
      if (process.platform === "darwin") {
        this.PATH = process.env.HOME + "/Library/Application Support";
        this.OsType = OsType.Mac;
      } else if (process.platform === "linux") {
        this.PATH =
          isXdg && !!process.env.XDG_CONFIG_HOME
            ? process.env.XDG_CONFIG_HOME
            : os.homedir() + "/.config";
        this.OsType = OsType.Linux;
      } else if (process.platform === "win32") {
        this.PATH = process.env.APPDATA || "";
        this.OsType = OsType.Windows;
      } else {
        this.PATH = "/var/local";
        this.OsType = OsType.Linux;
      }
    }

    if (this.isPortable) {
      this.PATH = process.env.VSCODE_PORTABLE || "";
      if (process.platform === "darwin") {
        this.OsType = OsType.Mac;
      } else if (process.platform === "linux") {
        this.OsType = OsType.Linux;
      } else if (process.platform === "win32") {
        this.OsType = OsType.Windows;
      } else {
        this.OsType = OsType.Linux;
      }
    }

    if (!this.isPortable) {
      const possibleCodePaths = [];
      if (this.isInsiders) {
        possibleCodePaths.push("/Code - Insiders");
      } else if (this.isOss) {
        possibleCodePaths.push("/Code - OSS");
        possibleCodePaths.push("/VSCodium");
      } else {
        possibleCodePaths.push("/Code");
      }
      for (const possibleCodePath of possibleCodePaths) {
        try {
          fs.statSync(this.PATH + possibleCodePath);
          this.PATH = this.PATH + possibleCodePath;
          break;
        } catch (e) {
          console.error("Error :" + possibleCodePath);
          console.error(e);
        }
      }
      this.USER_FOLDER = this.PATH.concat("/User/");
    } else {
      this.USER_FOLDER = this.PATH.concat("/user-data/User/");
    }
  }

  private getSettingsPath() {
    return path.join(this.USER_FOLDER, "settings.json");
  }

  public async getUserSettings() {
    let settingsPath = this.getSettingsPath();

    if (!(await fs.pathExists(settingsPath))) {
      return {};
    }

    return await fs.readJSON(settingsPath, { encoding: "utf8" });
  }

  public async updateUserSettings(update: Settings) {
    let existingSettings = await this.getUserSettings();

    let newSettings = Object.assign({}, existingSettings, update);

    await fs.writeJSON(this.getSettingsPath(), newSettings, {
      encoding: "utf8",
      spaces: 4
    });
  }
}
