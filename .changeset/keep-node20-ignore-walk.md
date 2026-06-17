---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): keep Node.js 20 support by holding `ignore-walk` at `^8.0.0`

`ignore-walk@9` is a Node-engines-only bump (no API changes) that raises the required Node.js version to `^22.22.2 || ^24.15.0 || >=26.0.0`. Since the only usage site is unchanged between v8 and v9, downgrade to `^8.0.0` so the package keeps working on Node.js 20 (`^20.17.0 || >=22.9.0`). See `DEPENDENCIES.md` for the rationale and the conditions under which this hold-back can be lifted.
