import * as vsls from "vsls";
import Config from "./config";

export async function initialize(
  config: Config,
  activateProfileHandler: (profile: string) => void
): Promise<void> {
  // Check to see if the end-user has the Live Share
  // extension installed, and if not, exit early.
  const liveShare = await vsls.getApi();
  if (!liveShare) {
    return;
  }

  // Begin listening for the beginning and end of Live
  // Share sessions, in case we need to switch profiles.
  liveShare.onDidChangeSession((e) => {
    // If the end-user never set a Live Share profile, then
    // there's nothing we need to do. Note that we're calling
    // this here, instead of as part of the activation flow,
    // so that the end-user can set their profile any time
    // and have it take effect immediately.
    const liveShareProfile = config.getLiveShareProfile();
    if (!liveShareProfile) {
      return;
    }

    if (e.session.id) {
      activateProfileHandler(liveShareProfile);
    } else {
      const previousProfile = config.getPreviousProfile();
      if (!previousProfile) {
        return;
      }

      config.setPreviousProfile(undefined);
      activateProfileHandler(previousProfile);
    }
  });
}
