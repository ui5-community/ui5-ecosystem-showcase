# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.20.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.19.0...ui5-app@0.20.0) (2022-08-17)


### Features

* **ui5-tooling-transpile:** new transpile extensions supporting TS ([#568](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/568)) ([8bed8ea](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/8bed8ea6dbf8f9aa37ff0a668ca2e8d4fd6d09b8))





# [0.19.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.18.0...ui5-app@0.19.0) (2022-08-11)


### Features

* **ui5-tooling-modules:** support namespacing of modules ([#614](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/614)) ([877f718](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/877f71873f7d20c0f27f2a1fccac6a9b1ad0905b))





# [0.18.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.17.0...ui5-app@0.18.0) (2022-06-27)


### Bug Fixes

* **ui5-tooling-modules:** properly consider browser, module, main fallback+ ([#631](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/631)) ([63b606e](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/63b606e38190543aea51197ea7db7ce81c1b1cf1))


### Features

* **ui5-tooling-modules:** support app-local bundle defs ([#632](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/632)) ([9375433](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/9375433b494bdbea79c6a13f3331087e14a1966e))





# [0.17.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.16.0...ui5-app@0.17.0) (2022-06-26)


### Bug Fixes

* **ui5-tooling-modules:** move nodePolyFills back to front ([#630](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/630)) ([1a2a39f](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/1a2a39fd5034866a0a42a9ea153939dae89ec268))


### Features

* **ui5-tooling-modules:** fix AMD bundling and filter Node built-ins ([#627](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/627)) ([0ad6e6e](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/0ad6e6e26a4b8a6ea1ec95721945696329dda9aa)), closes [#623](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/623)





# [0.16.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.15.3...ui5-app@0.16.0) (2022-06-21)


### Bug Fixes

* **ui5-tooling-modules:** avoid stackoverflow for html tags in xmlviews ([#625](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/625)) ([41bcf09](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/41bcf090b1d4f95f2aa5b9a279079009b64a66f7)), closes [#622](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/622)


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





## [0.15.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.15.2...ui5-app@0.15.3) (2022-06-03)

**Note:** Version bump only for package ui5-app





## [0.15.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.15.1...ui5-app@0.15.2) (2022-05-23)

**Note:** Version bump only for package ui5-app





## [0.15.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.15.0...ui5-app@0.15.1) (2022-05-22)

**Note:** Version bump only for package ui5-app





# [0.15.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.7...ui5-app@0.15.0) (2022-04-19)


### Features

* **ui5-tooling-modules:** allow to prepend path mappings for Component ([#605](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/605)) ([71e8ac6](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/71e8ac6d83d97859a2aae00d32651a2fc0fb42bc))





## [0.14.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.6...ui5-app@0.14.7) (2022-04-11)

**Note:** Version bump only for package ui5-app





## [0.14.6](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.5...ui5-app@0.14.6) (2022-04-07)

**Note:** Version bump only for package ui5-app





## [0.14.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.4...ui5-app@0.14.5) (2022-03-26)

**Note:** Version bump only for package ui5-app





## [0.14.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.3...ui5-app@0.14.4) (2022-03-24)

**Note:** Version bump only for package ui5-app





## [0.14.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.2...ui5-app@0.14.3) (2022-03-18)

**Note:** Version bump only for package ui5-app





## [0.14.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.1...ui5-app@0.14.2) (2022-03-04)

**Note:** Version bump only for package ui5-app





## [0.14.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.14.0...ui5-app@0.14.1) (2022-02-27)

**Note:** Version bump only for package ui5-app





# [0.14.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.13.1...ui5-app@0.14.0) (2022-02-24)


### Bug Fixes

* ensure middlewares work with Karma connect middleware ([#584](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/584)) ([c0ae49f](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/c0ae49fbcf49c6f667c86bfca291beefe6b74f27))


### Features

* **ui5-tooling-modules:** extended UI5 modules support ([#583](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/583)) ([fe2c8a7](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/fe2c8a72c9fa5e906db56ecf86c83621d0585eb8)), closes [#578](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/578)





## [0.13.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.13.0...ui5-app@0.13.1) (2022-02-22)

**Note:** Version bump only for package ui5-app





# [0.13.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.10...ui5-app@0.13.0) (2022-02-22)


### Bug Fixes

* e2e tests ([#571](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/571)) ([007287e](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/007287e9b60dfb5ca66382bae05914942f60a686))


### Features

* **ui5-middleware-onelogin:** auth support for arbitrary services ([edfb188](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/edfb1886706a58c503b15ab7ce04745c32765828))





## [0.12.10](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.9...ui5-app@0.12.10) (2022-02-07)

**Note:** Version bump only for package ui5-app





## [0.12.9](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.8...ui5-app@0.12.9) (2021-12-26)

**Note:** Version bump only for package ui5-app





## [0.12.8](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.7...ui5-app@0.12.8) (2021-10-29)

**Note:** Version bump only for package ui5-app





## [0.12.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.6...ui5-app@0.12.7) (2021-10-29)

**Note:** Version bump only for package ui5-app





## [0.12.6](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.5...ui5-app@0.12.6) (2021-10-28)

**Note:** Version bump only for package ui5-app





## [0.12.5](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.4...ui5-app@0.12.5) (2021-10-28)

**Note:** Version bump only for package ui5-app





## [0.12.4](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.3...ui5-app@0.12.4) (2021-10-28)

**Note:** Version bump only for package ui5-app





## [0.12.3](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.2...ui5-app@0.12.3) (2021-10-28)

**Note:** Version bump only for package ui5-app





## [0.12.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.1...ui5-app@0.12.2) (2021-10-28)


### Bug Fixes

* **deps:** update dependencies version ([2444781](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/2444781b4b2b7215b8e891dfe65c42167a668f66))





## [0.12.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.12.0...ui5-app@0.12.1) (2021-09-29)


### Bug Fixes

* **ui5-task-zipper:** Absolute Path Error for Third Party Dependencies ([#541](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/541)) ([fd6f022](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/fd6f0224c8b43a9252a233677c8bffb82521d991))





# [0.12.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.11.2...ui5-app@0.12.0) (2021-08-07)


### Features

* add ui5-task-minify-xml based on minify-xml ([0ac05de](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/0ac05dea4a2b5100cec01c143fec2e706db1b645))
* multitenancy config and routing ([#528](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/528)) ([83160c5](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/83160c5cd72d07061557fad9a643e7e5d0a0de26))





## [0.11.2](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.11.1...ui5-app@0.11.2) (2021-06-07)

**Note:** Version bump only for package ui5-app





## [0.11.1](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.11.0...ui5-app@0.11.1) (2021-06-06)

**Note:** Version bump only for package ui5-app





# [0.11.0](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.10.7...ui5-app@0.11.0) (2021-05-15)


### Bug Fixes

* rm another comma ([38e4b59](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/38e4b599c6f80ea62be07e3f8597d751b3830f7e))


### Features

* Less support for app development ([#512](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/512)) ([d0b381f](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/d0b381f74213fd75942cc887adc66874982f2fbc))





## [0.10.7](https://github.com/ui5-community/ui5-ecosystem-showcase/compare/ui5-app@0.10.6...ui5-app@0.10.7) (2021-05-05)

**Note:** Version bump only for package ui5-app





## [0.10.6](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.5...ui5-app@0.10.6) (2021-03-22)

**Note:** Version bump only for package ui5-app





## [0.10.5](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.4...ui5-app@0.10.5) (2021-03-10)

**Note:** Version bump only for package ui5-app





## [0.10.4](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.3...ui5-app@0.10.4) (2021-03-06)

**Note:** Version bump only for package ui5-app





## [0.10.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.2...ui5-app@0.10.3) (2021-02-16)

**Note:** Version bump only for package ui5-app





## [0.10.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.1...ui5-app@0.10.2) (2021-02-10)

**Note:** Version bump only for package ui5-app





## [0.10.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.10.0...ui5-app@0.10.1) (2021-01-28)

**Note:** Version bump only for package ui5-app





# [0.10.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.9.3...ui5-app@0.10.0) (2021-01-25)


### Features

* **simpleproxy:** Support configuration of proxied url parameters via .env and ui5.yaml  ([#440](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/440)) ([dafd66c](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/dafd66cd63d93553e7cf6dc797ef84c48e8575b6))
* **webjars:** support to serve content from JAR files ([#456](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/456)) ([b4ce282](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/b4ce282dde94b230175c02539c3e3c2d0487d478))





## [0.9.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.9.2...ui5-app@0.9.3) (2021-01-06)

**Note:** Version bump only for package ui5-app





## [0.9.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.9.1...ui5-app@0.9.2) (2021-01-05)

**Note:** Version bump only for package ui5-app





## [0.9.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.9.0...ui5-app@0.9.1) (2020-12-17)


### Bug Fixes

* **livereload:** adopted docu of exclusion patterns ([047188d](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/047188d2269300aff712c8bdecb6a3bb8bfbba5c))





# [0.9.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.8.3...ui5-app@0.9.0) (2020-12-17)


### Features

* add "keepResources" config flag + fix bug with missing dependencies ([#385](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/385)) ([aaaab50](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/aaaab508a5a64068b91207178b08a24dfe8f65a3))
* testing galore ([#338](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/338)) ([d4eddf7](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/d4eddf7fc1b64f832da5059d3d414f8ae454f1c7))





## [0.8.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.8.2...ui5-app@0.8.3) (2020-11-12)

**Note:** Version bump only for package ui5-app





## [0.8.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.8.1...ui5-app@0.8.2) (2020-11-03)

**Note:** Version bump only for package ui5-app





## [0.8.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.8.0...ui5-app@0.8.1) (2020-09-29)

**Note:** Version bump only for package ui5-app





# [0.8.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.7.2...ui5-app@0.8.0) (2020-09-29)


### Features

* **simpleproxy:** allow to increase payload limit ([7c5bbfb](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/7c5bbfb72d2196b02bc14e7bd7313de0584b5e7e))
* **stringreplacer:** new middleware and alignment of task ([40dcb4d](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/40dcb4d4442b0262699a779a13b565d8bba07a87))





## [0.7.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.7.1...ui5-app@0.7.2) (2020-09-20)

**Note:** Version bump only for package ui5-app





## [0.7.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.7.0...ui5-app@0.7.1) (2020-08-03)


### Bug Fixes

* use absolute path for servestatic middleware ([c6086ec](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/c6086ec057411188b240e722e751a0341c70647a)), closes [#278](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/278)





# [0.7.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.6.2...ui5-app@0.7.0) (2020-07-17)


### Features

* Enhance simpleproxy with adding configuration option for http headers ([#250](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/250)) ([8cfd528](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/8cfd528db846e40d940f854adc215a18c6b002ae))





## [0.6.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.6.1...ui5-app@0.6.2) (2020-07-06)

**Note:** Version bump only for package ui5-app





## [0.6.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.6.0...ui5-app@0.6.1) (2020-06-23)

**Note:** Version bump only for package ui5-app





# [0.6.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.5.0...ui5-app@0.6.0) (2020-05-27)


### Features

* new custom task - stringsreplacer ([#215](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/215)) ([2e02864](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/2e02864ce89da0f200c3a7da440706370771a8a7))





# [0.5.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.4.0...ui5-app@0.5.0) (2020-05-24)


### Bug Fixes

* **docu:** extra extensions config for livereload ([1f6149a](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/1f6149a97354a3360c608ab2027086f174cd908e))


### Features

* **pwa:** added pwa build for sample application ([c36baf2](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/c36baf24ed93e4e3634374c7ddcd426b8818876f))





# [0.4.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.3.2...ui5-app@0.4.0) (2020-05-06)


### Features

* **zipper:** allow to include additional files ([#198](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/198)) ([abf6d01](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/abf6d016d955a49763c59ac508b6267a760052e9))





## [0.3.2](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.3.1...ui5-app@0.3.2) (2020-05-05)

**Note:** Version bump only for package ui5-app





## [0.3.1](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.3.0...ui5-app@0.3.1) (2020-05-02)

**Note:** Version bump only for package ui5-app





# [0.3.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.2.0...ui5-app@0.3.0) (2020-05-01)


### Features

* **i18n:** ui5-task-i18ncheck ([#183](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/183)) ([5b4b033](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/5b4b033f8b7bdd57f9d1a93045740b55747b1611))





# [0.2.0](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.1.10...ui5-app@0.2.0) (2020-04-04)


### Features

* **middleware:** default index document ([#166](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/166)) ([afc27c2](https://github.com/petermuessig/ui5-ecosystem-showcase/commit/afc27c2d8793440b517bbd90803d75ebf10d33ce))





## [0.1.10](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.1.9...ui5-app@0.1.10) (2020-03-27)

**Note:** Version bump only for package ui5-app





## [0.1.9](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.1.8...ui5-app@0.1.9) (2020-03-25)

**Note:** Version bump only for package ui5-app





## [0.1.4](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.1.3...ui5-app@0.1.4) (2019-10-13)

**Note:** Version bump only for package ui5-app





## [0.1.3](https://github.com/petermuessig/ui5-ecosystem-showcase/compare/ui5-app@0.1.2...ui5-app@0.1.3) (2019-10-13)

**Note:** Version bump only for package ui5-app
