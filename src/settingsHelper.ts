import * as fs from "fs-extra";
import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { Settings } from "./services/config";
import * as jsonc from "jsonc-parser";

export enum OsType {
  Windows = 1,
  Linux,
  Mac,
}

export default class SettingsHelper {
  public isInsiders = false;
  public isOss = false;
  public isPortable = false;
  public homeDir: string;
  public USER_FOLDER: string;

  public PATH = "";
  public OsType: OsType = OsType.Windows;
  public ExtensionFolder: string;

  public constructor(private context: vscode.ExtensionContext) {
    this.isInsiders = /insiders/.test(process.execPath.toLowerCase());
    this.isPortable = process.env.VSCODE_PORTABLE ? true : false;
    this.isOss = /\boss\b/.test(process.execPath.toLowerCase());

    const isXdg =
      !this.isInsiders &&
      process.platform === "linux" &&
      !!process.env.XDG_DATA_HOME;
    this.homeDir = isXdg
      ? process.env.XDG_DATA_HOME || ""
      : process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"] ||
        "";
    const configSuffix = `${isXdg ? "" : "."}vscode${
      this.isInsiders ? "-insiders" : this.isOss ? "-oss" : ""
    }`;

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
      this.ExtensionFolder = path.join(
        this.homeDir,
        configSuffix,
        "extensions"
      );
      this.USER_FOLDER = this.PATH.concat("/User/");
    } else {
      this.USER_FOLDER = this.PATH.concat("/user-data/User/");
      this.ExtensionFolder = this.PATH.concat("/extensions/");
    }
  }

  private getSettingsPath() {
    return path.join(this.USER_FOLDER, "settings.json");
  }

  public async getUserSettings() {
    const settingsPath = this.getSettingsPath();

    if (!(await fs.pathExists(settingsPath))) {
      return {};
    }

    const fileContents = await fs.readFile(settingsPath, { encoding: "utf8" });

    return jsonc.parse(fileContents);
  }

  public async updateUserSettings(update: Settings) {
    const existingSettings = await this.getUserSettings();

    const newSettings = Object.assign({}, existingSettings, update);

    const settingsAsJson = JSON.stringify(newSettings, null, 4);

    await fs.writeFile(this.getSettingsPath(), settingsAsJson, {
      encoding: "utf8",
    });
  }

  public getCodeBinary() {
    const binaryFullPath: string = process.argv0;
    let codeInstallSuffix = "";
    let codeCliPath = "";
    if (this.OsType === OsType.Windows) {
      if (this.isInsiders) {
        codeInstallSuffix = "Code - Insiders";
        codeCliPath = "bin/code-insiders";
      } else {
        codeInstallSuffix = "Code";
        codeCliPath = "bin/code";
      }
    } else if (this.OsType === OsType.Linux) {
      if (this.isInsiders) {
        codeInstallSuffix = "code-insiders";
        codeCliPath = "bin/code-insiders";
      } else {
        codeInstallSuffix = "code";
        codeCliPath = "bin/code";
      }
    } else if (this.OsType === OsType.Mac) {
      codeInstallSuffix = "Frameworks";
      codeCliPath = "Resources/app/bin/code";
    }
    return `"${binaryFullPath.substr(
      0,
      binaryFullPath.lastIndexOf(codeInstallSuffix)
    )}${codeCliPath}"`;
  }
}
