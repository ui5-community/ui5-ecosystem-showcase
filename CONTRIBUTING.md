# Contribution Guide

This is the common top-level contribution guide for this monorepo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Development Environment

### Pre-Requisites

- [PNPM](https://pnpm.io/installation) >= 11.5.0
- A [Long-Term Support version](https://nodejs.org/en/about/releases/) of Node.js >= 22
- (optional) [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.

### Branches

The development branch is the `main` branch. It only supports extensions for UI5 CLI **V3**. The UI5 CLI extensions which also support the older versions of the UI5 CLI can be found in the [**V2** branch](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/v2).

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

There is no consistent testing tooling used for this repository. Some of the sub-packages are using [AVA][ava] (e.g. `ui5-middleware-approuter` or `ui5-task-zipper`). Creating tests for your UI5 CLI extensions is highly recommended and appreciated.

The UI5 application is using [QUnit][qunit], [OPA5][opa5] and [WDI5][wdi5] tests for validation.

[ava]: https://github.com/avajs/ava
[qunit]: https://sdk.openui5.org/topic/09d145cd86ee4f8e9d08715f1b364c51/
[opa5]: https://sdk.openui5.org/#/topic/22f175e7084247bc896c15280af9d1dc/
[wdi5]: https://ui5-community.github.io/wdi5/

### GitHub Actions

In case of facing issues with the central GitHub actions you can verify the GitHub actions locally. You need to install [act](https://github.com/nektos/act). `act` requires [Docker](https://www.docker.com/). To execute e.g. the `tests.yml` workflow locally, just run the following command:

```sh
act pull_request -W .github/workflows/tests.yml -e .github/workflows/.local-env.json
```

### Release Life-Cycle

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. Each public package under `packages/*` keeps its own version (independent versioning); private showcases under `showcases/*` are not published.

### Release Process

The release flow is fully automated through GitHub Actions — no local `lerna` or push permissions on `main` required.

**For contributors:** when your PR changes one or more public packages, add a changeset. There are three options, pick whichever fits:

| Command | When to use |
| --- | --- |
| `pnpm changeset:auto` | Recommended for most PRs. Walks the conventional-commit history on your branch and writes one `.changeset/auto-<sha>.md` per qualifying commit (packages from the commit `scope`, bump from the `type`, summary from the `subject`). Idempotent — safe to re-run. Already-covered commits are skipped, so hand-written changesets always win. |
| `pnpm changeset` | Interactive — pick packages, bump type, and write a summary by hand. Use when the auto-derived bump or summary is wrong (e.g. a `chore:` commit that secretly contains a `feat:`); the next `:auto` run will skip the commit because it's covered. |
| `pnpm changeset:empty` | Docs- or tooling-only PRs that touch no public package. Writes an empty `.changeset/*.md` so the CI changeset gate passes without producing any CHANGELOG entry. |

Whichever you pick, commit the resulting `.changeset/*.md` file alongside your code change.

**For maintainers:** the release itself happens entirely on GitHub.

- When a PR with changesets is merged into `main`, the [`Release`](.github/workflows/release.yml) workflow opens (or updates) a single **`Version Packages`** PR that aggregates all pending changesets — bumping versions, regenerating each package's `CHANGELOG.md`, and refreshing `pnpm-lock.yaml`.
- Review and merge that **`Version Packages`** PR when you want to cut a release.
- The same workflow then automatically publishes the new versions to npm (OIDC trusted publishing, with `NPM_BOOTSTRAP_TOKEN` as a fallback) and creates the matching git tags.
- Inspect the newly published artifacts on npmjs.com.

You can also trigger the workflow manually via *Actions → Release → Run workflow* — useful if a previous run failed mid-publish.

### Upgrading the version of the dependencies

To upgrade the version of the dependencies `pnpm upgrade` is used. To execute the command in all packages you need to run the following command:

```bash
pnpm -r -L -i update
```
