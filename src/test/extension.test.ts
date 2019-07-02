/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import {
  ExtensionId,
  ConfigKey,
  ConfigProfilesKey,
  ConfigStorageKey
} from "../constants";
import Config from "../services/config";
import SettingsHelper from "../settingsHelper";

suite("basic extension tests", () => {
  test("extension is registered", () => {
    const extension = vscode.extensions.getExtension(ExtensionId);
    assert.isDefined(extension);
  });

  test("extension can activate", done => {
    const extension = vscode.extensions.getExtension(
      ExtensionId
    ) as vscode.Extension<any>;

    setTimeout(() => {
      assert.isTrue(extension.isActive);
      done();
    }, 200);
  });
});

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

suite("end to end testing", () => {
  const profileName = "end-to-end-test";
  const profileSettings = {
    "editor.fontSize": 24,
    "workbench.colorTheme": "Default Light+"
  };

  class MockMemento implements vscode.Memento {
    public get<T>(key: string): T | undefined;
    public get<T>(key: string, defaultValue: T): T;
    public get(key: any, defaultValue?: any) {
      console.log(`${key}:${defaultValue}`);
      throw new Error("Method not implemented.");
    }
    public update(key: string, value: any): Thenable<void> {
      console.log(`${key}:${value}`);
      throw new Error("Method not implemented.");
    }
  }

  class MockContext implements vscode.ExtensionContext {
    public subscriptions: { dispose(): any }[];
    public workspaceState: vscode.Memento;
    public globalState: vscode.Memento;
    public extensionPath: string;
    public asAbsolutePath(relativePath: string): string {
      console.log(relativePath);
      return process.execPath;
    }
    public storagePath: string | undefined;
    public globalStoragePath: string;
    public logPath: string;

    public constructor() {
      this.subscriptions = [];
      this.extensionPath = "";
      this.globalStoragePath = "";
      this.logPath = "";

      this.workspaceState = new MockMemento();
      this.globalState = new MockMemento();
    }
  }

  let mockContext = new MockContext();

  setup(async function() {
    this.settingsHelper = new SettingsHelper(mockContext);
    this.defaultSettings = await this.settingsHelper.getUserSettings();
    this.config = new Config();
  });

  teardown(async function() {
    await this.settingsHelper.updateUserSettings(this.defaultSettings);
    await this.config.removeProfile(profileName);
    await this.config.removeProfileSettings(profileName);
  });

  test("can change the vscode layout based on profile", async function() {
    await this.config.addProfile(profileName);
    await this.config.addProfileSettings(profileName, profileSettings);

    let updateSettings = this.config.getProfileSettings(profileName);

    await this.settingsHelper.updateUserSettings(updateSettings);

    let currentSettings = await this.settingsHelper.getUserSettings();

    assert.equal(
      currentSettings["editor.fontSize"],
      profileSettings["editor.fontSize"]
    );

    // uncomment for local testing if you want to view the changes applied to vscode
    // await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
