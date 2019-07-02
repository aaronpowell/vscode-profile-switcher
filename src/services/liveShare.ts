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

    liveShare.onDidChangeSession(e => {
        const liveShareProfile = config.getLiveShareProfile();
        if (!liveShareProfile) {
            return;
        }

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