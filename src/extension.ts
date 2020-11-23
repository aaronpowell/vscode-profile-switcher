import * as vscode from "vscode";
import SettingsHelper from "./settingsHelper";
import ContributedCommands from "./commands";
import Config from "./services/config";
import ExtensionHelper from "./services/extensions";
import logger from "./services/logger";
import * as liveShare from "./services/liveShare";

async function activateProfile(
  profile: string,
  config: Config,
  settingsHelper: SettingsHelper,
  extensionsHelper: ExtensionHelper
) {
  const msg = vscode.window.setStatusBarMessage("Switching profiles.");

  await config.setCurrentProfile(profile);

  const profileSettings = config.getProfileSettings(profile);
  await settingsHelper.updateUserSettings(profileSettings);

  const extensions = config.getProfileExtensions(profile);
  await extensionsHelper.installExtensions(extensions, logger);
  await extensionsHelper.removeExtensions(extensions, logger);

  msg.dispose();

  const message = await vscode.window.showInformationMessage(
    "Do you want to reload and activate the extensions?",
    "Yes"
  );

  if (message === "Yes") {
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }
}

async function promptProfile(config: Config): Promise<string | undefined> {
  const profiles = config.getProfiles();

  if (!profiles.length) {
    await vscode.window.showInformationMessage(
      "There are no profiles saved to switch to. First save a profile and then you can pick it"
    );
    return;
  }

  const profile = await vscode.window.showQuickPick(profiles, {
    placeHolder: "Select a profile",
  });

  return profile;
}

function selectProfile(
  config: Config,
  settingsHelper: SettingsHelper,
  extensionsHelper: ExtensionHelper
) {
  return async () => {
    const profile = await promptProfile(config);
    if (!profile) {
      return;
    }

    await activateProfile(profile, config, settingsHelper, extensionsHelper);
  };
}

function selectLiveShareProfile(config: Config) {
  return async () => {
    const profile = await promptProfile(config);
    if (!profile) {
      return;
    }

    await config.setLiveShareProfile(profile);
  };
}

function saveProfile(
  config: Config,
  settingsHelper: SettingsHelper,
  extensionsHelper: ExtensionHelper
) {
  return async () => {
    const profiles = config.getProfiles();

    let profile = await vscode.window.showQuickPick(
      [...profiles, "New profile"],
      {
        placeHolder: "Select a profile",
      }
    );

    if (!profile || profile === "New profile") {
      profile = await vscode.window.showInputBox({
        placeHolder: "Enter the profile name",
      });

      if (!profile) {
        return;
      }

      await config.addProfile(profile);
    }

    const userSettings = await settingsHelper.getUserSettings();

    const extensions = extensionsHelper.getInstalled();

    await config.addProfileSettings(profile, userSettings);
    await config.addExtensions(profile, extensions);

    vscode.window.showInformationMessage(`Profile ${profile} has been saved.`);
  };
}

function deleteProfile(config: Config) {
  return async () => {
    const profiles = config.getProfiles();

    if (!profiles.length) {
      await vscode.window.showInformationMessage(
        "There are no profiles saved."
      );
      return;
    }

    const profile = await vscode.window.showQuickPick(profiles, {
      placeHolder: "Select a profile",
    });

    if (!profile) {
      return;
    }

    await config.removeProfile(profile);
    await config.removeProfileSettings(profile);
    await config.removeProfileExtensions(profile);

    await vscode.window.showInformationMessage(
      `Profile ${profile} has been deleted.`
    );
  };
}

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const config = new Config(context);
  const settingsHelper = new SettingsHelper(context);
  const extensionsHelper = new ExtensionHelper(context, settingsHelper, config);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.SelectLiveShareProfile,
      selectLiveShareProfile(config)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.SelectProfile,
      selectProfile(config, settingsHelper, extensionsHelper)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.SaveProfile,
      saveProfile(config, settingsHelper, extensionsHelper)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ContributedCommands.DeleteProfile,
      deleteProfile(config)
    )
  );

  liveShare.initialize(config, (profile: string) => {
    activateProfile(profile, config, settingsHelper, extensionsHelper);
  });
}
