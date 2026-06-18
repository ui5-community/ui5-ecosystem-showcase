---
"dev-approuter": patch
---

fix(dev-approuter): drop stale `engines.node: ">=18"` declaration

The package declared `engines.node: ">=18"`, but its `@sap/approuter@22` dependency actually requires `^22.0.0 || ^24.0.0`. The declaration was therefore misleading — `npm install` on Node 18 would have looked allowed by `dev-approuter` itself but failed (or at least warned) on the transitive `@sap/approuter` constraint.

Removing the field aligns `dev-approuter` with every other publishable package in the monorepo (none declare `engines`) and lets the effective Node.js floor be correctly inherited from `@sap/approuter`. See `DEPENDENCIES.md` for the audit details.
