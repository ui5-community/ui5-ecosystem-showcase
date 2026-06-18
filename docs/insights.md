---
title: Insights
layout: default
nav_order: 6
permalink: /insights/
description: "Repo stats, governance, history — what's behind the UI5 Ecosystem Showcase."
---

# Insights
{: .no_toc }

A look behind the scenes — numbers, governance, history.
{: .fs-5 .fw-300 }

<details markdown="block">
  <summary>Table of contents</summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## At a glance

[![License](https://img.shields.io/github/license/ui5-community/ui5-ecosystem-showcase)](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/LICENSE)
[![Open issues](https://img.shields.io/github/issues/ui5-community/ui5-ecosystem-showcase)](https://github.com/ui5-community/ui5-ecosystem-showcase/issues)
[![Open PRs](https://img.shields.io/github/issues-pr/ui5-community/ui5-ecosystem-showcase)](https://github.com/ui5-community/ui5-ecosystem-showcase/pulls)
[![Last commit](https://img.shields.io/github/last-commit/ui5-community/ui5-ecosystem-showcase/main)](https://github.com/ui5-community/ui5-ecosystem-showcase/commits/main)
[![Stars](https://img.shields.io/github/stars/ui5-community/ui5-ecosystem-showcase?style=social)](https://github.com/ui5-community/ui5-ecosystem-showcase/stargazers)

| | |
| --- | --- |
| Published packages | **27** ([catalog](../extensions/)) |
| Demo apps in `showcases/` | **13** |
| Repository | [`ui5-community/ui5-ecosystem-showcase`](https://github.com/ui5-community/ui5-ecosystem-showcase) |
| License | Apache 2.0 |
| Package manager | pnpm workspaces |
| Release tooling | [Changesets](https://github.com/changesets/changesets) (independent versioning) |
| CI | GitHub Actions: tests, e2e, commitlint, CodeQL, automated release |

## Download trends

Some packages from this repo see *millions* of downloads per month. Quick links to npmjs.com / npm-stat for the most-used ones:

- [`ui5-tooling-transpile`](https://www.npmjs.com/package/ui5-tooling-transpile) — transpile UI5 sources with Babel
- [`ui5-tooling-modules`](https://www.npmjs.com/package/ui5-tooling-modules) — consume NPM packages as UI5 modules
- [`ui5-task-zipper`](https://www.npmjs.com/package/ui5-task-zipper) — bundle a `webapp` into a zip
- [`ui5-middleware-livereload`](https://www.npmjs.com/package/ui5-middleware-livereload) — live-reload sources during dev
- [`ui5-middleware-simpleproxy`](https://www.npmjs.com/package/ui5-middleware-simpleproxy) — proxy backend requests during dev

For a combined dashboard, try [npm-stat for the `ui5-` prefix](https://npm-stat.com/charts.html?package=ui5-tooling-transpile&package=ui5-tooling-modules&package=ui5-task-zipper&package=ui5-middleware-livereload&package=ui5-middleware-simpleproxy).

## Governance

This is a **community project** under the [`ui5-community`](https://github.com/ui5-community) GitHub organization — *not* an official SAP project. There is no SLA and no official support, but the community is active and the maintainer team is responsive.

- **Open day-to-day**: PRs against `packages/*` are reviewed by package maintainers and other community contributors.
- **Tighter for supply-chain paths**: changes to GitHub Actions workflows, Dependabot config, the root `package.json`, the lockfile, and the security policy require review from [`@ui5-community/maintainers`](https://github.com/orgs/ui5-community/teams/maintainers) (see [`CODEOWNERS`](https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/.github/CODEOWNERS)).
- **NPM publishing**: trusted publishing via OIDC, with `NPM_BOOTSTRAP_TOKEN` as a fallback. No hand-rolled tokens floating around contributor laptops.
- **Conventional commits + Changesets**: every public-package change carries a Changeset, which the release workflow rolls into an aggregated *Version Packages* PR.

## A short history

The repo started as a place to *show* what the UI5 CLI's task and middleware extensibility could do — a handful of demo middlewares, a handful of demo apps. Over time, several of those demos became real, widely-used NPM packages: `ui5-tooling-transpile` for TypeScript-first UI5 development, `ui5-tooling-modules` for consuming NPM packages directly, `ui5-task-zipper` for SAP BTP deployment, `ui5-middleware-livereload`, `ui5-middleware-simpleproxy`. The repo evolved into the de-facto reference monorepo for UI5 CLI extensions, and stayed that way.

The mission hasn't changed: **show how UI5 can be extended, ship the tools that prove it, and lower the barrier for the next contributor.**

## Get involved

- 💬 Talk to us on [OpenUI5 Slack `#tooling`](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/).
- 🐛 [Open an issue](https://github.com/ui5-community/ui5-ecosystem-showcase/issues) or send a PR.
- 🔍 Browse the wider community on [bestofui5.org](https://bestofui5.org/).
- 🛠️ [Contribute](../contributing/) your own task or middleware.
