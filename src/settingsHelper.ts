import * as fs from "fs-extra";
import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { Settings } from "./services/config";
import * as jsonc from "jsonc-parser";
import { ConfigKey, ConfigStorageKey } from "./constants";

export enum OsType {
  Windows = 1,
  Linux,
  Mac
}

export default class SettingsHelper {
  public isInsiders: boolean = false;
  public isOss: boolean = false;
  public isPortable: boolean = false;
  public homeDir: string;
  public USER_FOLDER: string;

  public PATH: string = "";
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

  public getWorkspaceSettingsPath() {
    if (this.hasOpenWorkspace()) {
      // probably don't want to cast to any if I can avoid it...
      return (vscode.workspace as any).workspaceFile.path;
    } else {
      return null;
    }
  }

  public hasOpenWorkspace() {
    // probably don't want to cast to any if I can avoid it...
    return !!(vscode.workspace as any).workspaceFile;
  }

  public async getUserSettings() {
    let settingsPath = this.getSettingsPath();

    if (!(await fs.pathExists(settingsPath))) {
      return {};
    }

    let fileContents = await fs.readFile(settingsPath, { encoding: "utf8" });

    return jsonc.parse(fileContents);
  }

  public async getExistingWorkspaceSettings() {
    let settingsPath = this.getWorkspaceSettingsPath();

    if (!(await fs.pathExists(settingsPath))) {
      return {};
    }

    let fileContents = await fs.readFile(settingsPath, { encoding: "utf8" });

    return jsonc.parse(fileContents);
  }

  public async getProfileSettings(profile: string, combinedSettings: Settings): Promise<Settings> {
    let userSettings = await this.getUserSettings();
    let storedProfileSettings = userSettings[ConfigKey + "." + ConfigStorageKey][profile];
    let profileSettings: any = { ...combinedSettings };

    let storedKeys = Object.keys(storedProfileSettings);

    for (let key of storedKeys) {
      if (storedProfileSettings[key] !== combinedSettings[key]) {
        profileSettings[key] = storedProfileSettings[key];
      }
    }

    return profileSettings;
  }

  public async getWorkspaceSettings(profile: string, combinedSettings: Settings): Promise<any> { // might be able to change this to Settings model
    let userSettings = await this.getUserSettings();
    let storedProfileSettings = userSettings[ConfigKey + "." + ConfigStorageKey][profile];
    let workspaceSettings: any = {};

    let storedKeys = Object.keys(storedProfileSettings);

    for (let key of storedKeys) {
      // TODO: update this to do a deeper, recursive check. For now it should at least work for basic settings
      if (storedProfileSettings[key] !== combinedSettings[key]) {
        workspaceSettings[key] = combinedSettings[key];
      }
    }

    return workspaceSettings;
  }

  public async updateUserSettings(update: Settings) {
    let existingSettings = await this.getUserSettings();

    // I can check for differences between existingSettings' settings in the profileSwitcher.storage block and update,
    // and any differences can be assumed to be workspace-specific settings that should update the workspace json file
    // instead of the settings.json file
    let newSettings = Object.assign({}, existingSettings, update);

    let settingsAsJson = JSON.stringify(newSettings, null, 4);

    await fs.writeFile(this.getSettingsPath(), settingsAsJson, {
      encoding: "utf8"
    });
  }

  public async updateWorkspaceSettings(update: Settings) {
    let existingSettings = await this.getExistingWorkspaceSettings();

    existingSettings.settings = Object.assign({}, existingSettings.settings, update);

    let settingsAsJson = JSON.stringify(existingSettings, null, 4);

    await fs.writeFile(this.getWorkspaceSettingsPath(), settingsAsJson, { encoding: "utf8" });
  }

  public getCodeBinary() {
    let binaryFullPath: string = process.argv0;
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
