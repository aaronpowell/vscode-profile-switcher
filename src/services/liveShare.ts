import * as vscode from "vscode";
import * as vsls from "vsls";
import Config from "./config";

export async function initialize(
    context: vscode.ExtensionContext,
    config: Config,
    activateProfileHandler: (profile: string) => void
) {
    const liveShare = await vsls.getApi();
    if (!liveShare) {
        return;
    }

    const liveShareProfile = config.getLiveShareProfile();
    if (!liveShareProfile) {
        return;
    }

    // Check to see whether there was a lingering profile set
    // (e.g. because the user closed VS Code while in a Live Share
    // session), and if so, restore the right profile.
    restorePreviousProfile(config, activateProfileHandler);

    liveShare.onDidChangeSession(e => {
        if (e.session.id) {
            activateProfileHandler(liveShareProfile);
        } else {
            restorePreviousProfile(config, activateProfileHandler);
        }
    })
}

function restorePreviousProfile(
    config: Config,
    activateProfileHandler: (profile: string) => void
) {
    const previousProfile = config.getPreviousProfile();
    if (!previousProfile) {
        return;
    }

    config.setPreviousProfile(undefined);
    activateProfileHandler(previousProfile);
}