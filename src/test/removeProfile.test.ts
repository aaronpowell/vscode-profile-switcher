/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import { ConfigKey, ConfigProfilesKey, ConfigStorageKey } from "../constants";
import Config from "../services/config";

suite("remove profile", () => {
  const expectedProfileName = "test1";
  const expectedProfileSettings = { foo: "bar" };

  setup(async () => {
    let config = vscode.workspace.getConfiguration(ConfigKey);

    await config.update(
      ConfigProfilesKey,
      [expectedProfileName],
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      ConfigStorageKey,
      {
        [expectedProfileName]: expectedProfileSettings
      },
      vscode.ConfigurationTarget.Global
    );
  });

  test("can remove profile name", async () => {
    let config = new Config();

    await config.removeProfile(expectedProfileName);

    let profiles = config.getProfiles();

    assert.notInclude(profiles, expectedProfileName);
  });

  test("can remove profile settings", async () => {
    let config = new Config();

    await config.removeProfileSettings(expectedProfileName);

    let settings = config.getProfileSettings(expectedProfileName);

    assert.isUndefined(settings);
  });
});
