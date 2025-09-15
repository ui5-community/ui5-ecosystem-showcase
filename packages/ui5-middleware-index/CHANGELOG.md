# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.1.0...ui5-middleware-index@3.1.1) (2025-09-15)

**Note:** Version bump only for package ui5-middleware-index





# [3.1.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.5...ui5-middleware-index@3.1.0) (2024-09-06)


### Features

* enhanced v4 compat + update dependencies ([#1070](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/1070)) ([2d7ed16](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/2d7ed1623249febd32ecabdd2b47698f1cd968d5))





## [3.0.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.4...ui5-middleware-index@3.0.5) (2024-02-18)

**Note:** Version bump only for package ui5-middleware-index





## [3.0.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.3...ui5-middleware-index@3.0.4) (2023-11-09)


### Bug Fixes

* **ui5-middleware-index:** re-enable support for URL parameters ([#914](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/914)) ([5294d42](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/5294d4260fab3dec061c330b97eb34e5be644bb8)), closes [#912](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/912)





## [3.0.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.2...ui5-middleware-index@3.0.3) (2023-10-14)

**Note:** Version bump only for package ui5-middleware-index





## [3.0.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.1...ui5-middleware-index@3.0.2) (2023-09-07)


### Bug Fixes

* consistent request path handling of all middlewares ([#833](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/833)) ([11ad435](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/11ad4356ddb6f8503ebf46039ad898b1c4aec7c9)), closes [#817](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/817)





## [3.0.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@3.0.0...ui5-middleware-index@3.0.1) (2023-09-03)


### Bug Fixes

* **ui5-middleware-cfdestination:** support UAA flow ([#828](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/828)) ([20a0df1](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/20a0df16155f1f29b190525163cac457816c8a54)), closes [#817](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/817)





# [3.0.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.3.0...ui5-middleware-index@3.0.0) (2023-07-31)


### Features

* migration to UI5 Tooling V3 ([#776](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/776)) ([c03bc0e](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/c03bc0e8a8d0b55d38510164c885022e11b597e6))
* prepare versions for release for UI5 Tooling V3 ([#778](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/778)) ([5d2da55](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/5d2da55e77513e026377aca799c413560c651f56)), closes [#770](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/770)


### BREAKING CHANGES

* The support for UI5 Tooling V2 has been removed





# [0.3.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.10...ui5-middleware-index@0.3.0) (2022-06-21)


### Features

* replace yarn with pnpm ([#619](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/619)) ([ae7f654](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/ae7f6544f010d4b97c8a4db28ea89d01389b5fb5))


### BREAKING CHANGES

* new package manager

* refactor: updated tests to pass with pnpm

* refactor: iasync still failing

* feat(ui5-tooling-modules): support pnpm / node_modules symlinks

* fix(ui5-app): make Karma work with pnpm

* chore(ui5-app): remove uiveri5 from sample

* chore(ui5-app): add updated wdio.conf

* fix: make prettier and eslint work with pnpm

* fix: fix cf_dest tests

restructured tests and added node_modules as symlink

* fix(ui5-app): adding eslint for wdio and mocha

* chore(ui5-middleware-cfdestination): cleanup

* feat(ui5-tooling-modules): add bundling support for AMD

* chore(ui5-tooling-modules): cleanup

* chore: fix code style

* fix(ui5-task-flatten-library): support files without extensions

* refactor: updated tests to pass with pnpm

* feat(ui5-tooling-modules): support pnpm / node_modules symlinks

* fix: make prettier and eslint work with pnpm

* fix: update actions, lerna, vscode for pnpm

* chore: only run test on tooling extensions

* chore: use sequential tests for ava

* chore: add @ui5/cli dev dependency for ava tests

* chore: enable support for local act GH action tests

* chore: add docu for local GitHub action execution

* chore: docu cleanup

* chore: re-add ncu scripts

Co-authored-by: Peter Muessig <peter.muessig@sap.com>





## [0.2.10](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.9...ui5-middleware-index@0.2.10) (2022-05-22)

**Note:** Version bump only for package ui5-middleware-index





## [0.2.9](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.8...ui5-middleware-index@0.2.9) (2022-04-19)


### Reverts

* Revert "chore: add metadata to `package.json` for all packages for ui5-community website (#600)" (#601) ([b6037d4](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/b6037d4d397275ad2d83e7f18415c45a878c76bf)), closes [#600](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/600) [#601](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/601)





## [0.2.8](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.7...ui5-middleware-index@0.2.8) (2022-04-11)

**Note:** Version bump only for package ui5-middleware-index





## [0.2.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.6...ui5-middleware-index@0.2.7) (2022-02-24)


### Bug Fixes

* ensure middlewares work with Karma connect middleware ([#584](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/584)) ([c0ae49f](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/c0ae49fbcf49c6f667c86bfca291beefe6b74f27))





## [0.2.6](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.5...ui5-middleware-index@0.2.6) (2021-10-29)

**Note:** Version bump only for package ui5-middleware-index





## [0.2.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.4...ui5-middleware-index@0.2.5) (2021-10-28)


### Bug Fixes

* **index:** improved docu ([6bfd98b](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/6bfd98bd6cff10a9cc1a5f26d9933cd654216666))





## [0.2.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.3...ui5-middleware-index@0.2.4) (2021-10-28)


### Bug Fixes

* **index:** improved docu ([d69755d](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/d69755d36a5d1604e37bf71fa60bc9295ce639a1))





## [0.2.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.2...ui5-middleware-index@0.2.3) (2021-05-05)

**Note:** Version bump only for package ui5-middleware-index





## [0.2.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.1...ui5-middleware-index@0.2.2) (2020-09-20)

**Note:** Version bump only for package ui5-middleware-index





## [0.2.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.2.0...ui5-middleware-index@0.2.1) (2020-07-17)

**Note:** Version bump only for package ui5-middleware-index





# [0.2.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.1.1...ui5-middleware-index@0.2.0) (2020-05-24)


### Features

* **pwa:** added pwa build for sample application ([c36baf2](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/c36baf24ed93e4e3634374c7ddcd426b8818876f))





## [0.1.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-middleware-index@0.1.0...ui5-middleware-index@0.1.1) (2020-05-01)

**Note:** Version bump only for package ui5-middleware-index





# 0.1.0 (2020-04-04)


### Features

* **middleware:** default index document ([#166](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/166)) ([afc27c2](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/afc27c2d8793440b517bbd90803d75ebf10d33ce))
