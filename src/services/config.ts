import * as vscode from "vscode";
import { ConfigKey, ConfigProfilesKey, ConfigStorageKey } from "../constants";

interface Storage { [key: string]: any }

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

  public addProfileSettings(profile: string, settings: any) {
    // We don't want to save profile info in the profile storage
    if (settings["profileSwitcher.profiles"]) {
      delete settings["profileSwitcher.profiles"];
    }

    if (settings["profileSwitcher.storage"]) {
      delete settings["profileSwitcher.storage"];
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
}

export default Config;
