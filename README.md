# VS Code Profile Switcher

This extension allows you to define a number of settings profiles that you can easily switch between. The original idea for this extension came from my desire to have an easy way for me to switch my VS Code to a setup that was better optimised for presenting (changed themes, increase font size, etc).

## Install

* Open **Extensions** sidebar panel in Visual Studio Code. `View → Extensions`
* Search for `Profile Switcher`
* Click **Install**
* Click **Reload**, if required

## Features

The extension introduces three new commands that you can use from the command panel. All commands are prefixed with `Profile Switcher`.

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