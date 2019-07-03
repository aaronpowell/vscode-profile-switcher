/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import {
  ConfigKey,
  ConfigProfilesKey,
  ConfigStorageKey,
  ConfigExtensionsKey
} from "../constants";
import Config from "../services/config";
import { ExtensionInfo } from "../services/extensions";

suite("save profile", () => {
  const expectedProfileName = "test1";
  teardown(async () => {
    let config = vscode.workspace.getConfiguration(ConfigKey);

    await config.update(
      ConfigProfilesKey,
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

  suite("settings", () => {
    const expectedProfileSettings = { foo: "bar" };
    const expectedUpdatedProfileSettings = { foo: "baz", a: "b" };

    teardown(async () => {
      let config = vscode.workspace.getConfiguration(ConfigKey);

      await config.update(
        ConfigStorageKey,
        undefined,
        vscode.ConfigurationTarget.Global
      );
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

  suite("extensions", () => {
    const expectedExtensions = [
      new ExtensionInfo("abcd", "test.ext", "test", "1.0.0", "ext")
    ];
    const expectedUpdatedExtensions = [
      new ExtensionInfo("abcd", "test.ext", "test", "1.0.0", "ext"),
      new ExtensionInfo("12345", "test2.ext", "test2", "1.0.0", "ext")
    ];

    teardown(async () => {
      let config = vscode.workspace.getConfiguration(ConfigKey);

      await config.update(
        ConfigExtensionsKey,
        undefined,
        vscode.ConfigurationTarget.Global
      );
    });

    test("can save extensions", async () => {
      var config = new Config();

      await config.addExtensions(expectedProfileName, expectedExtensions);

      let settings = config.getProfileExtensions(expectedProfileName);
      assert.deepEqual(settings, expectedExtensions);
    });

    test("can update existing profile", async () => {
      var config = new Config();

      await config.addExtensions(expectedProfileName, expectedExtensions);
      await config.addExtensions(
        expectedProfileName,
        expectedUpdatedExtensions
      );

      let settings = config.getProfileExtensions(expectedProfileName);
      assert.deepEqual(settings, expectedUpdatedExtensions);
    });
  });
});
