/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import Config from "../../services/config";
import SettingsHelper from "../../settingsHelper";

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

suite("end to end testing", () => {
  const profileName = "end-to-end-test";
  const profileSettings = {
    "editor.fontSize": 24,
    "workbench.colorTheme": "Default Light+"
  };

  let mockContext = new MockContext();

  setup(async function () {
    this.settingsHelper = new SettingsHelper(mockContext);
    this.defaultSettings = await this.settingsHelper.getUserSettings();
    this.config = new Config();
  });

  teardown(async function () {
    await this.settingsHelper.updateUserSettings(this.defaultSettings);
    await this.config.removeProfile(profileName);
    await this.config.removeProfileSettings(profileName);
  });

  test("can change the vscode layout based on profile", async function () {
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
