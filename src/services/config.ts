import * as vscode from "vscode";
import {
  ConfigKey,
  ConfigProfilesKey,
  ConfigStorageKey,
  ConfigExtensionsKey,
  ConfigExtensionsIgnoreKey
} from "../constants";
import { ExtensionInfo } from "./extensions";

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
  private getConfig() {
    return vscode.workspace.getConfiguration(ConfigKey);
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
    // We don't want to save profile info in the profile storage
    if (settings[`${ConfigKey}:${ConfigProfilesKey}`]) {
      delete settings[`${ConfigKey}:${ConfigProfilesKey}`];
    }

    if (settings[`${ConfigKey}:${ConfigStorageKey}`]) {
      delete settings[`${ConfigKey}:${ConfigStorageKey}`];
    }

    let storage = this.getStorage();
    storage[profile] = settings;
    return this.updateStorage(storage);
  }

  public removeProfileSettings(profile: string) {
    let storage = this.getStorage();
    delete storage[profile];
    return this.updateStorage(storage);
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
    let storage = this.getExtensions();
    delete storage[profile];
    return this.updateExtensions(storage);
  }

  public getIgnoredExtensions() {
    let config = this.getConfig();

    return config.get<string[]>(ConfigExtensionsIgnoreKey, []);
  }
}

export default Config;
