# Contribution Guide

This is the common top-level contribution guide for this monorepo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Development Environment

### pre-requisites

- [Yarn](https://yarnpkg.com/lang/en/docs/install/) >= 1.22.10
- A [Long-Term Support version](https://nodejs.org/en/about/releases/) of node.js
- (optional) [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.

### Initial Setup

The initial setup is trivial:

- clone this repo
- `yarn`

### Commit Messages format

This project enforces the [conventional-commits][conventional_commits] commit message formats.
The possible commits types prefixes are limited to those defined by [conventional-commit-types][commit_types].
This promotes a clean project history and enabled automatically generating a changelog.

The commit message format will be inspected both on a git pre-commit hook
and during the central CI build and will **fail the build** if issues are found.

### Formatting

[Prettier](https://prettier.io/) is used for some of the sub-packages to do a proper code formatting.

### Compiling

This project is implemented using plain ECMAScript without any compilation / transpilation steps.

### Testing

There is no consistent testing tooling used for this repository. Some of the sub-packages are using [AVA][ava].

The UI5 application is using [OPA5][opa5], [UIVeri5][ui5veri5] and [WDIO5][wdio5] tests for validation.

[ava]: https://github.com/avajs/ava
[opa5]: https://openui5.hana.ondemand.com/topic/22f175e7084247bc896c15280af9d1dc
[uiveri5]: https://github.com/SAP/ui5-uiveri5
[wdi5]: https://github.com/js-soft/wdi5#readme

### Release Life-Cycle

This monorepo uses Lerna's [Independent][lerna-mode] mode which allows subpackages to have different versions.

[lerna-mode]: https://github.com/lerna/lerna#independent-mode

### Release Process

Performing a release requires push permissions to the repository.

- Ensure you are on the default branch and synced with origin.
- `yarn run release:version`
- Follow the lerna CLI instructions.
- Track the newly pushed **tag** (`/*@^[0-9]+(\.[0-9]+)*/`) build in the build system
  until successful completion.
- Inspect the newly artifacts published on npmjs.com / Github Releases / other relevant release targets.

### Upgrading the version of the dependencies

To upgrade the version of the dependencies `yarn upgrade-interactive` is used. To execute the command in all packages you need to run the following command:

```bash
yarn upgrade-interactive --latest
```
