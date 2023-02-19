# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.10.8](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.7...ui5-middleware-cfdestination@0.10.8) (2023-02-19)

### Bug Fixes

- enable middlewares for UI5 tooling 3.x ([#687](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/687)) ([ab87cb6](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/ab87cb6480338cd4b83fe5a33e193bc67a9a4724))

## [0.10.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.6...ui5-middleware-cfdestination@0.10.7) (2023-02-19)

### Bug Fixes

- **ui5-middleware-cfdestionation:** support h2 devserver mode ([#683](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/683)) ([e9ab783](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/e9ab783f9d72fd6d043a566938e4c5baf73d93f0)), closes [#641](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/641)

## [0.10.6](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.5...ui5-middleware-cfdestination@0.10.6) (2023-02-08)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.10.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.4...ui5-middleware-cfdestination@0.10.5) (2023-01-25)

### Bug Fixes

- **ui5-tooling-modules:** make amd bundling more robust for side effects ([#679](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/679)) ([1d0e586](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/1d0e5862e99a3e86f4bf4e25440df10aa02b9617))

## [0.10.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.3...ui5-middleware-cfdestination@0.10.4) (2023-01-23)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.10.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.2...ui5-middleware-cfdestination@0.10.3) (2023-01-21)

### Bug Fixes

- **ui5-tooling-modules:** ignore relative paths ([#676](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/676)) ([259aac7](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/259aac754233925bed6bdbd1f79a13757786b1c6))

## [0.10.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.1...ui5-middleware-cfdestination@0.10.2) (2023-01-03)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.10.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.10.0...ui5-middleware-cfdestination@0.10.1) (2022-12-31)

### Bug Fixes

- cfdestination multitenancy requires fsbasepath ([70af3f3](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/70af3f38d23b18f85eb6aaf704413d91fc52bb13))
- fixes compatibility issues with V3 ([1ba4c57](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/1ba4c578165e061e7c6455d558eb9effd868f842))
- use correct xsappPath when using custom xsappJson filename ([#653](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/653)) ([f2196bc](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/f2196bc2cba2ba8076ee18506d1c5c3e4d609b92))

# [0.10.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.9.1...ui5-middleware-cfdestination@0.10.0) (2022-12-20)

### Features

- **ui5-tooling-transpile:** enable config files ([#660](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/660)) ([9f854ec](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/9f854ec45f514664a9b25e85137553877c52577a))

## [0.9.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.9.0...ui5-middleware-cfdestination@0.9.1) (2022-06-26)

**Note:** Version bump only for package ui5-middleware-cfdestination

# [0.9.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.7...ui5-middleware-cfdestination@0.9.0) (2022-06-21)

### Features

- replace yarn with pnpm ([#619](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/619)) ([ae7f654](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/ae7f6544f010d4b97c8a4db28ea89d01389b5fb5))

### BREAKING CHANGES

- new package manager

- refactor: updated tests to pass with pnpm

- refactor: iasync still failing

- feat(ui5-tooling-modules): support pnpm / node_modules symlinks

- fix(ui5-app): make Karma work with pnpm

- chore(ui5-app): remove uiveri5 from sample

- chore(ui5-app): add updated wdio.conf

- fix: make prettier and eslint work with pnpm

- fix: fix cf_dest tests

restructured tests and added node_modules as symlink

- fix(ui5-app): adding eslint for wdio and mocha

- chore(ui5-middleware-cfdestination): cleanup

- feat(ui5-tooling-modules): add bundling support for AMD

- chore(ui5-tooling-modules): cleanup

- chore: fix code style

- fix(ui5-task-flatten-library): support files without extensions

- refactor: updated tests to pass with pnpm

- feat(ui5-tooling-modules): support pnpm / node_modules symlinks

- fix: make prettier and eslint work with pnpm

- fix: update actions, lerna, vscode for pnpm

- chore: only run test on tooling extensions

- chore: use sequential tests for ava

- chore: add @ui5/cli dev dependency for ava tests

- chore: enable support for local act GH action tests

- chore: add docu for local GitHub action execution

- chore: docu cleanup

- chore: re-add ncu scripts

Co-authored-by: Peter Muessig <peter.muessig@sap.com>

## [0.8.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.6...ui5-middleware-cfdestination@0.8.7) (2022-05-23)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.8.6](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.5...ui5-middleware-cfdestination@0.8.6) (2022-05-22)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.8.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.4...ui5-middleware-cfdestination@0.8.5) (2022-04-19)

### Reverts

- Revert "chore: add metadata to `package.json` for all packages for ui5-community website (#600)" (#601) ([b6037d4](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/b6037d4d397275ad2d83e7f18415c45a878c76bf)), closes [#600](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/600) [#601](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/601)

## [0.8.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.3...ui5-middleware-cfdestination@0.8.4) (2022-04-11)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.8.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.2...ui5-middleware-cfdestination@0.8.3) (2022-02-24)

### Bug Fixes

- ensure middlewares work with Karma connect middleware ([#584](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/584)) ([c0ae49f](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/c0ae49fbcf49c6f667c86bfca291beefe6b74f27))

## [0.8.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.1...ui5-middleware-cfdestination@0.8.2) (2022-02-22)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.8.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.8.0...ui5-middleware-cfdestination@0.8.1) (2022-02-07)

**Note:** Version bump only for package ui5-middleware-cfdestination

# [0.8.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.7.3...ui5-middleware-cfdestination@0.8.0) (2021-12-26)

### Features

- **ui5-task-stringreplacer,ui5-middleware-stringreplacer:** support for multiple .env files ([29e246a](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/29e246abba7b82f0f42a6f16316e5029de638d26)), closes [#545](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/545)

## [0.7.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.7.2...ui5-middleware-cfdestination@0.7.3) (2021-10-29)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.7.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.7.1...ui5-middleware-cfdestination@0.7.2) (2021-10-28)

### Bug Fixes

- **deps:** update dependencies version ([2444781](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/2444781b4b2b7215b8e891dfe65c42167a668f66))

## [0.7.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.7.0...ui5-middleware-cfdestination@0.7.1) (2021-09-29)

### Bug Fixes

- **ui5-task-zipper:** Absolute Path Error for Third Party Dependencies ([#541](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/541)) ([fd6f022](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/fd6f0224c8b43a9252a233677c8bffb82521d991))

# [0.7.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.6.0...ui5-middleware-cfdestination@0.7.0) (2021-08-07)

### Features

- multitenancy config and routing ([#528](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/528)) ([83160c5](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/83160c5cd72d07061557fad9a643e7e5d0a0de26))

# [0.6.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.5.0...ui5-middleware-cfdestination@0.6.0) (2021-06-07)

### Features

- add default options for cfdestination ([#527](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/527)) ([1a29c83](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/1a29c83d659002bb6dbe3f7f7da0ecbfdb3afa2a))

# [0.5.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.4.3...ui5-middleware-cfdestination@0.5.0) (2021-06-06)

### Features

- **testing,localDir:** middleware cf-destination ([#526](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/526)) ([24127c5](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/24127c58b9369a0c230d129da856ad8635100759))

## [0.4.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.4.2...ui5-middleware-cfdestination@0.4.3) (2021-05-15)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.4.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.4.1...ui5-middleware-cfdestination@0.4.2) (2021-05-05)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.4.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.4.0...ui5-middleware-cfdestination@0.4.1) (2021-03-10)

### Bug Fixes

- auth routes config (fixes [#506](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/506)) ([f9ae45c](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/f9ae45c53625334845df968f2771646295ebf04a))

# [0.4.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.3.1...ui5-middleware-cfdestination@0.4.0) (2021-02-16)

### Features

- add auth to routes ([#492](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/492)) ([ef735c4](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/ef735c4024c3bad8fe5a3e8d98dea4874edf6cd3))

## [0.3.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.3.0...ui5-middleware-cfdestination@0.3.1) (2021-01-25)

**Note:** Version bump only for package ui5-middleware-cfdestination

# [0.3.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.2.4...ui5-middleware-cfdestination@0.3.0) (2020-12-17)

### Features

- adding a second filter criteria ([#410](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/410)) ([2181f64](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/2181f64306e2605bec6571bc78330d74ca46f3a9))

## [0.2.4](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.2.3...ui5-middleware-cfdestination@0.2.4) (2020-09-29)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.2.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.2.2...ui5-middleware-cfdestination@0.2.3) (2020-09-20)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.2.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.2.1...ui5-middleware-cfdestination@0.2.2) (2020-08-03)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.2.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.2.0...ui5-middleware-cfdestination@0.2.1) (2020-07-17)

**Note:** Version bump only for package ui5-middleware-cfdestination

# [0.2.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.1.8...ui5-middleware-cfdestination@0.2.0) (2020-05-24)

### Features

- **pwa:** added pwa build for sample application ([c36baf2](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/c36baf24ed93e4e3634374c7ddcd426b8818876f))

## [0.1.8](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.1.7...ui5-middleware-cfdestination@0.1.8) (2020-05-01)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.1.7](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.1.6...ui5-middleware-cfdestination@0.1.7) (2020-04-04)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.1.6](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.1.5...ui5-middleware-cfdestination@0.1.6) (2020-03-25)

**Note:** Version bump only for package ui5-middleware-cfdestination

## [0.1.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-cfdestination@0.1.2...ui5-middleware-cfdestination@0.1.3) (2019-10-13)

**Note:** Version bump only for package ui5-middleware-cfdestination
