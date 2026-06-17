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
