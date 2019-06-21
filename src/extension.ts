import * as vscode from "vscode";
import SettingsHelper from "./settingsHelper";

function getProfiles(profileSwitcherSettings: vscode.WorkspaceConfiguration) {
  return profileSwitcherSettings.get<string[]>("profiles", []).sort();
}

export async function activate(context: vscode.ExtensionContext) {
  let config = new SettingsHelper(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.selectProfile", async () => {
      let profileSwitcherSettings = vscode.workspace.getConfiguration(
        "profileSwitcher"
      );
      let profiles = getProfiles(profileSwitcherSettings);

      if (!profiles.length) {
        await vscode.window.showInformationMessage(
          "There are no profiles saved to switch to. First save a profile and then you can pick it"
        );
        return;
      }

      let profile = await vscode.window.showQuickPick(profiles, {
        placeHolder: "Select a profile"
      });

      if (!profile) {
        return;
      }

      let storage = profileSwitcherSettings.get<{ [key: string]: any }>(
        "storage",
        {}
      );

      await config.updateUserSettings(storage[profile]);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.saveProfile", async () => {
      let profileSwitcherSettings = vscode.workspace.getConfiguration(
        "profileSwitcher"
      );
      let profiles = getProfiles(profileSwitcherSettings);

      let profile = await vscode.window.showQuickPick(
        [...profiles, "New profile"],
        {
          placeHolder: "Select a profile"
        }
      );

      if (!profile || profile === "New profile") {
        profile = await vscode.window.showInputBox({
          placeHolder: "Enter the profile name"
        });

        if (!profile) {
          return;
        }

        profiles.push(profile);
      }

      await profileSwitcherSettings.update(
        "profiles",
        profiles,
        vscode.ConfigurationTarget.Global
      );

      let userSettings = await config.getUserSettings();

      // We don't want to save profile info in the profile storage
      if (userSettings["profileSwitcher.profiles"]) {
        delete userSettings["profileSwitcher.profiles"];
      }

      if (userSettings["profileSwitcher.storage"]) {
        delete userSettings["profileSwitcher.storage"];
      }

      let storage = profileSwitcherSettings.get<{ [key: string]: any }>(
        "storage",
        {}
      );
      storage[profile] = userSettings;
      await profileSwitcherSettings.update(
        "storage",
        storage,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `Profile ${profile} has been saved.`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.deleteProfile", async () => {
      let profileSwitcherSettings = vscode.workspace.getConfiguration(
        "profileSwitcher"
      );
      let profiles = getProfiles(profileSwitcherSettings);

      if (!profiles.length) {
        await vscode.window.showInformationMessage(
          "There are no profiles saved."
        );
        return;
      }

      let profile = await vscode.window.showQuickPick(profiles, {
        placeHolder: "Select a profile"
      });

      if (!profile) {
        return;
      }

      let newProfiles = profiles
        .slice(0, profiles.indexOf(profile))
        .concat(profiles.slice(profiles.indexOf(profile) + 1, profiles.length));

      await profileSwitcherSettings.update(
        "profiles",
        newProfiles,
        vscode.ConfigurationTarget.Global
      );

      let storage = profileSwitcherSettings.get<{ [key: string]: any }>(
        "storage",
        {}
      );

      delete storage[profile];

      await profileSwitcherSettings.update(
        "storage",
        storage,
        vscode.ConfigurationTarget.Global
      );

      await vscode.window.showInformationMessage(
        `Profile ${profile} has been deleted.`
      );
    })
  );
}
