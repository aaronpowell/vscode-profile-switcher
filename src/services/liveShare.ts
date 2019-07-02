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
        if (e.session.id) {
            const liveShareProfile = config.getLiveShareProfile();
            if (!liveShareProfile) {
                return;
            }

            activateProfileHandler(liveShareProfile);
        } else {
            const previousProfile = config.getPreviousProfile();
            if (!previousProfile) {
                return;
            }

            config.setPreviousProfile(undefined);
            activateProfileHandler(previousProfile);
        }
    })
}