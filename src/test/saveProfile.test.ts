/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import { ConfigKey, ConfigProfilesKey, ConfigStorageKey } from "../constants";
import Config from "../services/config";

suite("save profile", () => {
  const expectedProfileName = "test1";
  const expectedProfileSettings = { foo: "bar" };
  const expectedUpdatedProfileSettings = { foo: "baz", a: "b" };

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

  test("can save a profile name", async () => {
    var config = new Config();

    await config.addProfile(expectedProfileName);

    let profiles = config.getProfiles();
    assert.include(profiles, expectedProfileName);
  });

  test("can save profile settings", async () => {
    var config = new Config();

    await config.addProfileSettings(
      expectedProfileName,
      expectedProfileSettings
    );

    let settings = config.getProfileSettings(expectedProfileName);
    assert.deepEqual(settings, expectedProfileSettings);
  });

  test("can update existing profile", async () => {
    var config = new Config();

    await config.addProfileSettings(
      expectedProfileName,
      expectedProfileSettings
    );
    await config.addProfileSettings(
      expectedProfileName,
      expectedUpdatedProfileSettings
    );

    let settings = config.getProfileSettings(expectedProfileName);
    assert.deepEqual(settings, expectedUpdatedProfileSettings);
  });
});
