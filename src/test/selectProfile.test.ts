/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import { ConfigKey, ConfigProfilesKey, ConfigStorageKey } from "../constants";
import Config from "../services/config";

suite("select profile", () => {
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

  teardown(async () => {
    let config = vscode.workspace.getConfiguration(ConfigKey);

    await config.update(
      ConfigProfilesKey,
      undefined,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      ConfigStorageKey,
      undefined,
      vscode.ConfigurationTarget.Global
    );
  });

  test("list of profiles will contain the expected one", () => {
    let config = new Config();

    let profiles = config.getProfiles();

    assert.include(profiles, expectedProfileName);
  });

  test("storage contains the expected profile", () => {
    let config = new Config();

    let settings = config.getProfileSettings(expectedProfileName);

    assert.deepEqual(settings, expectedProfileSettings);
  });
});
