# Change Log

All notable changes to the "vscode-profile-switcher" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.3.1] - 2019-07-19

### Changed

- Fixing bug [#8](https://github.com/aaronpowell/vscode-profile-switcher/issues/8) by changing the JSON parser used

## [0.3.0] - 2019-07-03

### Added

- Working on support for enable/disable extensions as you change profiles (Issue [#2](https://github.com/aaronpowell/vscode-profile-switcher/issues/2))
- Add support for setting a Live Share profile that is auto-activated (PR [#4](https://github.com/aaronpowell/vscode-profile-switcher/pull/4))

### Changed

- Using [`jsonc`](https://npmjs.org/package/jsonc) for parsing the `settings.json` file so it won't fail if there are comments (see [#3](https://github.com/aaronpowell/vscode-profile-switcher/issues/3))

## [0.2.0] - 2019-06-28

### Added

- Introduced testing

### Changed

- Tweaked Azure Pipelines to test across multiple OS's
- Rewriting internals

## [0.1.3] - 2019-06-24

### Changed

- Tweaking settings for marketplace

## [0.1.2] - 2019-06-24

### Added

- Adding a logo
- Adding a demo of extension to readme
- Added Azure Pipelines for CI/CD

## 0.1.1 - 2019-06-21

### Added

- Initial preview release release
