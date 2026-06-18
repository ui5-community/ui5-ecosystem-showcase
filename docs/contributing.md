---
title: Contributing
layout: default
nav_order: 5
permalink: /contributing/
description: "Two paths to contribute a UI5 CLI extension — inside this monorepo or self-managed in your own repo."
---

# Contributing
{: .no_toc }

The UI5 community thrives on shared extensions. Whether you want to ship inside this monorepo or maintain in your own repo, both paths are welcome.
{: .fs-5 .fw-300 }

<details markdown="block">
  <summary>Table of contents</summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Two ways to contribute

### Path 1 — Contribute to this monorepo

You can integrate your task, middleware, or full UI5 CLI extension directly into [`ui5-ecosystem-showcase`](https://github.com/ui5-community/ui5-ecosystem-showcase).

**You get:**

- Automated NPM publishing via GitHub Actions and [Changesets](https://github.com/changesets/changesets) — no NPM credentials to manage.
- Free CI: lint, format, commitlint, CodeQL, test workflows already set up.
- Reviews from the community before merge.
- Visibility on this site and on [bestofui5.org](https://bestofui5.org/).

**You agree to:**

- Continue maintaining the extension and triaging its issues.
- Use [conventional commits](https://www.conventionalcommits.org/) — enforced by a pre-commit hook *and* by CI.
- Write a [Changeset](https://github.com/changesets/changesets) for every PR that touches a public package (three flavours: `pnpm changeset:auto`, `pnpm changeset`, `pnpm changeset:empty`).
- Follow the naming convention (`ui5-task-*`, `ui5-middleware-*`, `ui5-tooling-*`).

The full development workflow (pnpm, branches, testing, release flow) lives in [`CONTRIBUTING.md`](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/CONTRIBUTING.md).

### Path 2 — Self-managed in your own repo

If you'd rather keep full control — your own release cadence, your own CI, your own license terms — keep your extension in your own repository. In that case:

- Stick to the [naming convention](#naming-convention) so the rest of the ecosystem can find it.
- Check for duplicates in [Best of UI5](https://bestofui5.org/) and on the [NPM registry](https://www.npmjs.com/) before publishing.
- **Submit your package to [Best of UI5](https://github.com/ui5-community/bestofui5-data/issues/new?assignees=marianfoo&labels=new%20package&template=new_package.md&title=Add%20new%20Package:)** — this is how UI5 developers will discover your work.
- Consider adding a `keywords` entry like `ui5-task`, `ui5-middleware`, or `ui5-tooling` to your `package.json` for NPM searchability.

## Naming convention

When you publish to NPM, the prefix tells the rest of the ecosystem what your package is:

| Prefix | What it is |
| --- | --- |
| `ui5-task-*` | A UI5 CLI task (build-time) |
| `ui5-middleware-*` | A UI5 CLI middleware (dev-server) |
| `ui5-tooling-*` | A UI5 CLI extension that combines tasks **and** middlewares |

Sticking to these prefixes is what makes [`https://www.npmjs.com/search?q=ui5-task-`](https://www.npmjs.com/search?q=ui5-task-), [`...?q=ui5-middleware-`](https://www.npmjs.com/search?q=ui5-middleware-), and [`...?q=ui5-tooling-`](https://www.npmjs.com/search?q=ui5-tooling-) usable as discovery tools.

## Quick development setup

```bash
# Pre-requisites: pnpm >= 11.5.0, Node.js LTS >= 22

git clone https://github.com/ui5-community/ui5-ecosystem-showcase.git
cd ui5-ecosystem-showcase
pnpm install

# Run the showcase app in dev mode
pnpm dev

# Run all the things in CI mode locally
pnpm test:ci
```

See [`CONTRIBUTING.md`](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/CONTRIBUTING.md) for the deeper details — branches, formatting, releases, dependency upgrades, local GitHub Actions runs via `act`.

## Code of conduct & security

- [Code of Conduct](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/CODE_OF_CONDUCT.md) — we use the Contributor Covenant. Reach the community team at `ui5communityteam@gmail.com`.
- [Security policy](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/SECURITY.md) — please use GitHub's private vulnerability reporting, not public issues.
