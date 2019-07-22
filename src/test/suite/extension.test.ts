/* eslint @typescript-eslint/no-explicit-any: "off" */
import { assert } from "chai";
import * as vscode from "vscode";
import { ExtensionId } from "../../constants";

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
