import * as vscode from "vscode";
import {
  ConfigKey,
  ConfigProfilesKey,
  ConfigStorageKey,
  ConfigExtensionsKey,
  ConfigExtensionsIgnoreKey,
  ConfigLiveShareProfileKey,
  ContextSettingCurrentProfile,
  ContextSettingPreviousProfile,
} from "../constants";
import { ExtensionInfo } from "./extensions";
import ContributedCommands from "../commands";

export interface Settings {
  [key: string]: number | string | boolean | unknown;
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

  public getLiveShareProfile(): string | null {
    const config = this.getConfig();

    return config.get<string | null>(ConfigLiveShareProfileKey, null);
  }

  public setLiveShareProfile(profile: string): Thenable<void> {
    const config = this.getConfig();

    return config.update(
      ConfigLiveShareProfileKey,
      profile,
      vscode.ConfigurationTarget.Global
    );
  }

  public async setCurrentProfile(profile: string): Promise<void> {
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

  private _statusBarItem?: vscode.StatusBarItem;

  public async showStatusBarCurrentProfile(): Promise<void> {
    if (this.context) {
      const profile = this.context.globalState.get<string>(
        ContextSettingCurrentProfile
      );

      if (!this._statusBarItem) {
        this._statusBarItem = vscode.window.createStatusBarItem(
          vscode.StatusBarAlignment.Right
        );
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

  public setPreviousProfile(profile: string | undefined): void {
    this.context &&
      this.context.globalState.update(ContextSettingPreviousProfile, profile);
  }

  public getProfiles(): string[] {
    const config = this.getConfig();

    return config.get<string[]>(ConfigProfilesKey, []).sort();
  }

  public getProfileSettings(profile: string): Settings {
    return this.getStorage()[profile];
  }

  public getProfileExtensions(profile: string): ExtensionInfo[] {
    return this.getExtensions()[profile] || [];
  }

  private getStorage() {
    const config = this.getConfig();

    return config.get<Storage>(ConfigStorageKey, {});
  }

  public addProfile(profile: string): Thenable<void> {
    const config = this.getConfig();

    const existingProfiles = this.getProfiles();

    return config.update(
      ConfigProfilesKey,
      [...existingProfiles, profile],
      vscode.ConfigurationTarget.Global
    );
  }

  public removeProfile(profile: string): Thenable<void> {
    const profiles = this.getProfiles();
    const newProfiles = profiles
      .slice(0, profiles.indexOf(profile))
      .concat(profiles.slice(profiles.indexOf(profile) + 1, profiles.length));

    const config = this.getConfig();

    return config.update(
      ConfigProfilesKey,
      newProfiles,
      vscode.ConfigurationTarget.Global
    );
  }

  public addProfileSettings(
    profile: string,
    settings: Settings
  ): Thenable<void> {
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

    const storage = this.getStorage();
    storage[profile] = settings;
    return this.updateStorage(storage);
  }

  private deleteStorage(storage: Storage | ExtensionStorage, profile: string) {
    return Object.keys(storage)
      .filter((sKey) => sKey != profile)
      .reduce((obj: any, key: string) => {
        obj[key] = storage[key];
        return obj;
      }, {});
  }

  public removeProfileSettings(profile: string): Thenable<void> {
    const storage = this.getStorage();
    const filteredStorage = this.deleteStorage(storage, profile);
    return this.updateStorage(filteredStorage);
  }

  private updateStorage(storage: Storage) {
    const config = this.getConfig();

    return config.update(
      ConfigStorageKey,
      storage,
      vscode.ConfigurationTarget.Global
    );
  }

  public addExtensions(
    profile: string,
    extensions: ExtensionInfo[]
  ): Thenable<void> {
    const storage = this.getExtensions();
    storage[profile] = extensions;
    return this.updateExtensions(storage);
  }

  private getExtensions() {
    const config = this.getConfig();

    return config.get<ExtensionStorage>(ConfigExtensionsKey, {});
  }

  private updateExtensions(storage: ExtensionStorage) {
    const config = this.getConfig();

    return config.update(
      ConfigExtensionsKey,
      storage,
      vscode.ConfigurationTarget.Global
    );
  }

  public removeProfileExtensions(profile: string): Thenable<void> {
    const storage = this.getExtensions();
    const filteredStorage = this.deleteStorage(storage, profile);
    return this.updateExtensions(filteredStorage);
  }

  public getIgnoredExtensions(): string[] {
    const config = this.getConfig();

    return config.get<string[]>(ConfigExtensionsIgnoreKey, []);
  }
}

export default Config;
