import * as vscode from "vscode";
import SettingsHelper from "./settingsHelper";
import ContributedCommands from "./commands";
import Config from "./services/config";

function selectProfile(config: Config, settingsHelper: SettingsHelper) {
  return async () => {
    let profiles = config.getProfiles();

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

    let profileSettings = config.getProfileSettings(profile);

    await settingsHelper.updateUserSettings(profileSettings);
  };
}

function saveProfile(config: Config, settingsHelper: SettingsHelper) {
  return async () => {
    let profiles = config.getProfiles();

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

      await config.addProfile(profile);
    }

    let userSettings = await settingsHelper.getUserSettings();
    await config.addProfileSettings(profile, userSettings);

    vscode.window.showInformationMessage(`Profile ${profile} has been saved.`);
  };
}

function deleteProfile(config: Config) {
  return async () => {
    let profiles = config.getProfiles();

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

    await config.removeProfile(profile);
    await config.removeProfileSettings(profile);

    await vscode.window.showInformationMessage(
      `Profile ${profile} has been deleted.`
    );
  };
}

export async function activate(context: vscode.ExtensionContext) {
  let settingsHelper = new SettingsHelper(context);
  let config = new Config();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.SelectProfile,
      selectProfile(config, settingsHelper)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.SaveProfile,
      saveProfile(config, settingsHelper)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.DeleteProfile,
      deleteProfile(config)
    )
  );
}
