# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [Unreleased](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.3.3...HEAD)
- None

# [1.3.3](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.3.2...v1.3.3) - 2021-04-16
### Fixed
- [Issue #22](https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/22): changed version injected into `.js` files to be multiline comments (`/* */`) to avoid issues
with aggressive minifiers.

### Security
- Upgraded vulnerable dependencies

# [1.3.2](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.3.1...v1.3.2) - 2021-02-10
### Fixed
- [Issue #18](https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/18): converted `log()` calls to `info()` calls to respect configured VI `logLevel`. Got tests back up to 100%.

# [1.3.1](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.3.0...v1.3.1) - 2021-02-10
### Fixed
- [Issue #17](https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/17): corrected rollup warning about source maps not being accurate. VI does not need to generate source maps.
  Updated VI config to tell rollup that existing source maps are still valid.

# [1.3.0](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.2.2...v1.3.0) - 2020-12-09
### Fixed
- [Issue #10](https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/10): work with chunks and output folders

### Added
- Upgraded to rollup v2

### Security
- Upgraded vulnerable dependencies

# [1.2.2](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.2.1...v1.2.2) - 2020-04-24
### Fixed
- [Issue #2](https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/2): updated file regex to not be global

# [1.2.1](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.2.0...v1.2.1) - 2020-04-24
### Security
- Upgraded vulnerable dependencies
### Added
- semantic-release, travis, and commitizen for easier maintainability

# [1.2.0](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.1.3...v1.2.0) - 2020-02-03
### Security
- Upgraded vulnerable dependencies
### Changed
- Changed default DateTimeStamp format from `June 9, 2007` to `June 9, 2007 17:46:12` [dateformat]'s `'longDate'` to `'mmmm d, yyyy HH:MM:ss'`
- README examples to flow better for quicker setup


# [1.1.3](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.1.2...v1.1.3) - 2019-08-27
### Security
- Upgraded vulnerable dependencies

# [1.1.2](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.1.0...v1.1.2) - 2019-07-25
### Added
- Pre-push hooks
### Fixed
- Typos in README
### Security
- Upgraded vulnerable dependencies


# [1.1.0](https://github.com/djhouseknecht/rollup-plugin-version-injector/compare/v1.0.0...v1.1.0) - 2019-06-28
### Added
- Usage, configuration, and instructions to README
- Unit tests
### Changed
- Separated code into multiple files


# [1.0.0](https://github.com/djhouseknecht/rollup-plugin-version-injector/releases/tag/v1.0.0) - 2019-06-26
### Added
- Initial release with working source code

[dateformat]: https://www.npmjs.com/package/dateformat
