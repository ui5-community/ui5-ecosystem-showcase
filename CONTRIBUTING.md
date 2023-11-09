# Contribution Guide

This is the common top-level contribution guide for this monorepo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Development Environment

### Pre-Requisites

- [PNPM](https://pnpm.io/installation) >= 8.6.0
- A [Long-Term Support version](https://nodejs.org/en/about/releases/) of Node.js
- (optional) [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.

### Branches

The development branch is the `main` branch. It only supports tooling extensions for UI5 Tooling **V3**. The tooling extensions which also support the older versions of the UI5 Tooling can be found in the [**V2** branch](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/v2).

### Initial Setup

The initial setup is trivial:

- Clone this repo
- Run `pnpm install`

### Commit Messages format

This project enforces the [conventional-commits][conventional_commits] commit message formats.
The possible commits types prefixes are limited to those defined by [conventional-commit-types][commit_types].
This promotes a clean project history and enabled automatically generating a changelog.

The commit message format will be inspected both on a git pre-commit hook
and during the central CI build and will **fail the build** if issues are found.

### Formatting

[Prettier](https://prettier.io/) is used for some of the sub-packages to do a proper code formatting.

### Compiling

This project is implemented using plain ECMAScript without any compilation / transpilation steps. Meanwhile, for some packages TypeScript is used (e.g. `ui5-middleware-onelogin`). Those packages have to be transpiled using the TypeScript compiler.

### Testing

There is no consistent testing tooling used for this repository. Some of the sub-packages are using [AVA][ava] (e.g. `ui5-middleware-approuter` or `ui5-task-zipper`). Creating tests for your tooling extensions is highly recommended and appreciated.

The UI5 application is using [QUnit][qunit], [OPA5][opa5] and [WDIO5][wdio5] tests for validation.

[ava]: https://github.com/avajs/ava
[qunit]: https://openui5.hana.ondemand.com/topic/09d145cd86ee4f8e9d08715f1b364c51
[opa5]: https://openui5.hana.ondemand.com/topic/22f175e7084247bc896c15280af9d1dc
[wdi5]: https://github.com/js-soft/wdi5#readme

### GitHub Actions

In case of facing issues with the central GitHub actions you can verify the GitHub actions locally. You need to install [act](https://github.com/nektos/act). `act` requires [Docker](https://www.docker.com/). To execute e.g. the `tests.yml` workflow locally, just run the following command:

```sh
act pull_request -W .github/workflows/tests.yml -e .github/workflows/.local-env.json
```

### Release Life-Cycle

This monorepo uses Lerna's [Independent][lerna-mode] mode which allows subpackages to have different versions.

[lerna-mode]: https://github.com/lerna/lerna#independent-mode

### Release Process

Performing a release requires push permissions to the repository.

- Ensure you are on the default branch and synced with origin.
- `pnpm release:version`
- Follow the lerna CLI instructions.
- Track the newly pushed **commit** with the message (`chore(release): publish`) which triggers the `Release (automatic)` GitHub action until successful completion.
- Inspect the newly artifacts published on npmjs.com.

### Upgrading the version of the dependencies

To upgrade the version of the dependencies `pnpm upgrade` is used. To execute the command in all packages you need to run the following command:

```bash
pnpm -r -L -i update
```
