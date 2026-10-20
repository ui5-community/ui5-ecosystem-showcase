---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): use dot notation without `module:` prefix for `@extends` in generated JSDoc

When a generated UI5 wrapper class extends another generated wrapper (not the top-of-chain
`sap.ui.core.webc.WebComponent` base), the `@extends` JSDoc tag was incorrectly produced as
`module:sap/ui/.../SomeControl` (slash notation with `module:` prefix). It now correctly uses
dot notation without any prefix, e.g. `sap.ui....SomeControl`, matching the JSDoc specification
and SDK tooling expectations.
