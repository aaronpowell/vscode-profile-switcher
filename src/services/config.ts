import * as vscode from "vscode";
import {
  ConfigKey,
  ConfigProfilesKey,
  ConfigStorageKey,
  ConfigExtensionsKey,
  ConfigExtensionsIgnoreKey,
  ConfigLiveShareProfileKey,
  ContextSettingCurrentProfile,
  ContextSettingPreviousProfile
} from "../constants";
import { ExtensionInfo } from "./extensions";
import ContributedCommands from "../commands";

export interface Settings {
  [key: string]: number | string | boolean | object;
}

export interface Storage {
  [key: string]: Settings;
}

interface ExtensionStorage {
  [key: string]: ExtensionInfo[];
}

class Config {
  public constructor(private context?: vscode.ExtensionContext) {}

  private getConfig() {
    return vscode.workspace.getConfiguration(ConfigKey);
  }

  public getLiveShareProfile() {
    let config = this.getConfig();

    return config.get<string | null>(ConfigLiveShareProfileKey, null);
  }

  public setLiveShareProfile(profile: string) {
    let config = this.getConfig();

    return config.update(
      ConfigLiveShareProfileKey,
      profile,
      vscode.ConfigurationTarget.Global
    );
  }

  public async setCurrentProfile(profile: string) {
    if (this.context) {
      const previousProfile = this.context.globalState.get<string>(
        ContextSettingCurrentProfile
      );
      this.setPreviousProfile(previousProfile);

      await this.context.globalState.update(
        ContextSettingCurrentProfile,
        profile
      );

      await this.showStatusBarCurrentProfile();
    }
  }

  private _statusBarItem : any;

  public async showStatusBarCurrentProfile() {
    if (this.context) {
      const profile = this.context.globalState.get<string>(
        ContextSettingCurrentProfile
      );

      if (!this._statusBarItem) {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this._statusBarItem.command = ContributedCommands.SelectProfile;
      }
      this._statusBarItem.text = `Profile: ${profile}`;
      this._statusBarItem.show();
    }

  }

  public getPreviousProfile(): string | undefined {
    return (
      this.context &&
      this.context.globalState.get(ContextSettingPreviousProfile)
    );
  }

  public setPreviousProfile(profile: string | undefined) {
    this.context &&
      this.context.globalState.update(ContextSettingPreviousProfile, profile);
  }

  public getProfiles() {
    let config = this.getConfig();

    return config.get<string[]>(ConfigProfilesKey, []).sort();
  }

  public getProfileSettings(profile: string) {
    return this.getStorage()[profile];
  }

  public getProfileExtensions(profile: string) {
    return this.getExtensions()[profile] || [];
  }

  private getStorage() {
    let config = this.getConfig();

    return config.get<Storage>(ConfigStorageKey, {});
  }

  public addProfile(profile: string) {
    let config = this.getConfig();

    let existingProfiles = this.getProfiles();

    return config.update(
      ConfigProfilesKey,
      [...existingProfiles, profile],
      vscode.ConfigurationTarget.Global
    );
  }

  public removeProfile(profile: string) {
    let profiles = this.getProfiles();
    let newProfiles = profiles
      .slice(0, profiles.indexOf(profile))
      .concat(profiles.slice(profiles.indexOf(profile) + 1, profiles.length));

    let config = this.getConfig();

    return config.update(
      ConfigProfilesKey,
      newProfiles,
      vscode.ConfigurationTarget.Global
    );
  }

  public addProfileSettings(profile: string, settings: Settings) {
    const deleteSetting = (key: string) => {
      if (`${ConfigKey}.${key}` in settings) {
        delete settings[`${ConfigKey}.${key}`];
      }
    };

    deleteSetting(ConfigProfilesKey);
    deleteSetting(ConfigStorageKey);
    deleteSetting(ConfigExtensionsKey);
    deleteSetting(ConfigExtensionsIgnoreKey);
    deleteSetting(ConfigLiveShareProfileKey);

    let storage = this.getStorage();
    storage[profile] = settings;
    return this.updateStorage(storage);
  }

  private deleteStorage(storage: Storage | ExtensionStorage, profile: string) {
    return Object.keys(storage)
    .filter(sKey => sKey != profile)
    .reduce((obj: any, key: string)=> {
      obj[key] = storage[key];
      return obj;
    },{});
  }

  public removeProfileSettings(profile: string) {
    const storage = this.getStorage();
    const filteredStorage = this.deleteStorage(storage, profile)
    return this.updateStorage(filteredStorage);
  }

  private updateStorage(storage: Storage) {
    let config = this.getConfig();

    return config.update(
      ConfigStorageKey,
      storage,
      vscode.ConfigurationTarget.Global
    );
  }

  public addExtensions(profile: string, extensions: ExtensionInfo[]) {
    let storage = this.getExtensions();
    storage[profile] = extensions;
    return this.updateExtensions(storage);
  }

  private getExtensions() {
    let config = this.getConfig();

    return config.get<ExtensionStorage>(ConfigExtensionsKey, {});
  }

  private updateExtensions(storage: ExtensionStorage) {
    let config = this.getConfig();

    return config.update(
      ConfigExtensionsKey,
      storage,
      vscode.ConfigurationTarget.Global
    );
  }

  public removeProfileExtensions(profile: string) {
    const storage = this.getExtensions();
    const filteredStorage = this.deleteStorage(storage, profile);
    return this.updateExtensions(filteredStorage);
  }

  public getIgnoredExtensions() {
    let config = this.getConfig();

    return config.get<string[]>(ConfigExtensionsIgnoreKey, []);
  }
}

export default Config;
