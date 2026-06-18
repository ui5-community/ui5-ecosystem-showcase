# Dependency Decisions

This document records intentional decisions to **hold back** or **deviate from**
the latest version of a dependency, including the reasoning. The goal is to
make it easy to revisit these pins when the constraints that motivated them
change (e.g. a project-wide minimum Node.js bump).

When you add or change an entry here, update both the rationale **and** the
"Revisit when …" trigger so a future maintainer (or Dependabot/Renovate
reviewer) can decide quickly whether the hold-back still applies.

---

## Pinned / held-back dependencies

### `ignore-walk` — held at `^8.0.0` (latest is `9.x`)

- **Package(s) affected:** [`ui5-tooling-modules`](packages/ui5-tooling-modules)
- **Held since:** 2026-06
- **Latest version available:** `9.x`
- **Pinned at:** `^8.0.0`

#### Rationale

`ignore-walk@9` is a Node-engines-only bump (no API changes) that raises the
required Node.js version to `^22.22.2 || ^24.15.0 || >=26.0.0`, dropping
Node.js 20 entirely.

| Version | Node.js engines |
| --- | --- |
| `ignore-walk@9` | `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |
| `ignore-walk@8` | `^20.17.0 \|\| >=22.9.0` |
| `ignore-walk@7` | `^18.17.0 \|\| >=20.5.0` |

`ui5-tooling-modules` is a UI5 CLI extension and therefore consumed by UI5
application projects in their build pipelines. Forcing those projects onto
Node.js 22.22.2+ purely because of an internal `ignore-walk` upgrade is a
disproportionate constraint — Node.js 20 is still a supported LTS line and
broadly used in UI5 build environments.

The only usage in `ui5-tooling-modules` is `walk.sync({ path })` in
[`packages/ui5-tooling-modules/lib/util.js`](packages/ui5-tooling-modules/lib/util.js),
which is identical in v8 and v9 — so there is no functional reason to upgrade
ahead of a project-wide Node.js floor bump.

#### Revisit when …

- The repository (or `ui5-tooling-modules` specifically) raises its supported
  Node.js floor to `>=22.22.2`, **or**
- `ignore-walk@9+` introduces a feature/fix we actually need, **or**
- `ignore-walk@8` reaches end-of-life / receives a security advisory that is
  not patched on the v8 line.

When any of the above is true, bump to the latest `ignore-walk` and remove
this entry.

---

## Node-22-only devDependencies (intentionally **not** held back)

The following `devDependencies` require Node.js `>=22` in their currently
pinned major. They are deliberately **not** held back: they only affect
contributors and the CI matrix that builds this monorepo. They do **not**
appear in any published package's `dependencies` or `peerDependencies`, so
consumers of the published UI5 CLI extensions on Node.js 20 are unaffected.

This section exists so a future maintainer doesn't have to re-derive this
audit when reviewing Dependabot/Renovate PRs against these tools.

| Package               | Range     | `engines.node`                 | Declared in       |
| --------------------- | --------- | ------------------------------ | ----------------- |
| `@commitlint/cli`     | `^21.0.2` | `>=22.12.0`                    | root              |
| `lint-staged`         | `^17.0.6` | `>=22.22.1`                    | root              |
| `eslint-plugin-jsdoc` | `^63.0.0` | `^22.13.0 \|\| >=24`           | root              |
| `ava`                 | `^8.0.1`  | `^22.20 \|\| ^24.12 \|\| >=26` | seven packages\*  |

\* `ui5-middleware-approuter`, `ui5-middleware-simpleproxy`,
`ui5-task-cachebuster`, `ui5-task-copyright`, `ui5-task-zipper`,
`ui5-tooling-modules`, `ui5-tooling-transpile`.

### Why not held back

- `ignore-walk` (above) is a **runtime** dependency of `ui5-tooling-modules`,
  so its Node-engines floor leaks all the way to the consuming UI5 build
  pipeline.
- The four entries above are **devDependencies of this repo only** —
  testing (`ava`), linting (`eslint-plugin-jsdoc`), and commit hygiene
  (`@commitlint/cli`, `lint-staged`). They are not bundled, not re-exported,
  and never installed alongside the published packages.

### Last Node-20-compatible major (if we ever need it)

If the project later decides to support Node 20 contributors as well, the
last Node-20-OK majors are:

| Package               | Last Node-20-OK major |
| --------------------- | --------------------- |
| `@commitlint/cli`     | `^20`                 |
| `lint-staged`         | `^16`                 |
| `eslint-plugin-jsdoc` | `^62`                 |
| `ava`                 | `^7`                  |

### `peerDependencies` and explicit `engines`

- No `peerDependencies` in any workspace package require Node `>=22`.
- No publishable package declares `engines.node` explicitly — they all
  inherit the effective floor from their runtime dependencies. With
  `ignore-walk` held at `^8`, that effective floor for
  `ui5-tooling-modules` consumers is Node `^20.17.0 || >=22.9.0`.
- Note: `packages/dev-approuter` previously declared
  `engines.node: ">=18"`, but its `@sap/approuter@22` dependency actually
  requires `^22.0.0 || ^24.0.0`. The stale `engines` field has been
  removed; the effective floor is now correctly inherited from
  `@sap/approuter`. (`@sap/approuter` is SAP's published runtime — there
  is no Node-20-compatible v21 line to hold it back to, and `dev-approuter`
  is a dev-time wrapper, so this Node-22 floor is intentional.)
