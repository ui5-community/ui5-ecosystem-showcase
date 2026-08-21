---
"ui5-tooling-modules": patch
---

Use meaningful variable names in generated UI5Control wrappers

Replace generic `WebComponentBaseClass` with the actual base class name (e.g. `WebComponent`, `HTMLElementBase`) and `WrapperClass` with the actual UI5 class simple name (e.g. `Button`, `LuigiContainer`) in generated AMD wrapper files. Applied to both the Rollup plugin and the CLI code path.
