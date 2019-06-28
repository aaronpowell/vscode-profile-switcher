# VS Code Profile Switcher

[![Build Status](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_apis/build/status/aaronpowell.vscode-profile-switcher?branchName=master)](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_build/latest?definitionId=27&branchName=master)

| Job                 | Status                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux (Node 10.x)   | [![Build Status](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_apis/build/status/aaronpowell.vscode-profile-switcher?branchName=master&jobName=Linux&configuration=Linux%20node_10_x)](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_build/latest?definitionId=27&branchName=master) |
| Linux (Node 12.x)   | [![Build Status](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_apis/build/status/aaronpowell.vscode-profile-switcher?branchName=master&jobName=Linux&configuration=Linux%20node_12_x)](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_build/latest?definitionId=27&branchName=master) |
| Windows (Node 10.x) | [![Build Status](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_apis/build/status/aaronpowell.vscode-profile-switcher?branchName=master&jobName=Windows)](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_build/latest?definitionId=27&branchName=master)                               |
| macOS (Node 10.x)   | [![Build Status](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_apis/build/status/aaronpowell.vscode-profile-switcher?branchName=master&jobName=macOS)](https://dev.azure.com/aaronpowell/VS%20Code%20Profile%20Switcher/_build/latest?definitionId=27&branchName=master)                                 |

[![Badge for version for Visual Studio Code extension aaronpowell.vscode-profile-switcher](https://vsmarketplacebadge.apphb.com/version/aaronpowell.vscode-profile-switcher.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=aaronpowell.vscode-profile-switcher&wt.mc_id=profileswitcher-github-aapowell) [![Installs](https://vsmarketplacebadge.apphb.com/installs-short/aaronpowell.vscode-profile-switcher.svg?color=blue&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=aaronpowell.vscode-profile-switcher&wt.mc_id=profileswitcher-github-aapowell)
[![Rating](https://vsmarketplacebadge.apphb.com/rating/aaronpowell.vscode-profile-switcher.svg?color=blue&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=aaronpowell.vscode-profile-switcher&wt.mc_id=profileswitcher-github-aapowell) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square)](http://opensource.org/licenses/MIT)

This extension allows you to define a number of settings profiles that you can easily switch between. The original idea for this extension came from my desire to have an easy way for me to switch my VS Code to a setup that was better optimised for presenting (changed themes, increase font size, etc).

## Install

- Open **Extensions** sidebar panel in Visual Studio Code. `View → Extensions`
- Search for `Profile Switcher`
- Click **Install**
- Click **Reload**, if required

## Features

The extension introduces three new commands that you can use from the command panel. All commands are prefixed with `Profile Switcher`.

![Demo of the extension in action](images/readme-demo.gif)

### Save Profile

This saved the current **user** settings with the name you provide. You can use this to create a new profile or you can update an existing profile. The profile, when saved, is done so against your user-level settings.

_Note: This looks at the settings at the **user** level and not the workspace._

### Select Profile

This allows you to select a previously saved profile. It'll replace it at the **user** level, not the **workspace** level. It works by merging your saved settings over the top of your current settings.

### Delete Profile

This removed a previously saved profile.

## Changes

See the [CHANGELOG](CHANGELOG.md) for the latest changes.

## Roadmap

Got an idea for what you'd like this extension to do? Feel free to [create an issue or pick up an open issue](https://github.com/aaronpowell/vscode-profile-switcher/issues).

## Resources

Want to build your own extensions? Here's some starting points

- [Get VS Code](https://code.visualstudio.com/?wt.mc_id=profileswitcher-github-aapowell)
- [Create your first VS Code extension](https://code.visualstudio.com/api/get-started/your-first-extension?wt.mc_id=profileswitcher-github-aapowell)
- [VS Code Extension API](https://code.visualstudio.com/api/references/vscode-api?wt.mc_id=profileswitcher-github-aapowell)
- [Learn how to add WebPack bundles to your favorite extensions](https://code.visualstudio.com/updates/v1_32#_bundling-extensions-with-webpack?wt.mc_id=profileswitcher-github-aapowell)

## Credits

This was my first time trying to build an extension for VS Code and wouldn't have got this far without:

- The VS Code team's [in depth guide to extensions](https://code.visualstudio.com/api/get-started/your-first-extension?wt.mc_id=profileswitcher-github-aapowell)
- Looking through the [example extensions](https://github.com/Microsoft/vscode-extension-samples) on the VS Code team's GitHub
- [John Papa's Peacock extension](https://raw.githubusercontent.com/johnpapa/vscode-peacock)
- [VS Code Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) that helped me understand how to find settings on a machine
