import * as vscode from "vscode";

export interface Logger {
  appendLine(value: string): void;
  show(preserveFocus?: boolean): void;
}

class OutputChannelLogger implements Logger {
  public show(preserveFocus?: boolean | undefined): void {
    const oc = this.getChannel();
    oc.show(preserveFocus);
  }
  public appendLine(value: string): void {
    const oc = this.getChannel();

    oc.appendLine(value);
  }

  private outputChannel: vscode.OutputChannel | null = null;

  private getChannel() {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel(
        "Profile Switcher"
      );
    }

    return this.outputChannel;
  }
}

export default new OutputChannelLogger();
