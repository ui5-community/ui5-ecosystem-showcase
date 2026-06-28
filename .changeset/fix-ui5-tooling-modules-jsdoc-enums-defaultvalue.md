---
"ui5-tooling-modules": patch
---

Fix JSDoc generation for enum types and `defaultValue` handling in the generated UI5 metadata.

- Use the derived UI5 class name (instead of the raw enum name) in the `@ui5-module-override` directive emitted by `JSDocSerializer`, so the override matches the generated module.
- Emit `moduleType: module:<slashed-qualified-name>` for enum-typed properties so the downstream JSDoc build/validation can resolve enum references.
- Track `_ui5QualifiedNameSlashes` and `_derivedUi5ClassName` on enum definitions when ingesting the custom-elements metadata.
- Drop the ad-hoc `defaultValue` cast and the string-escape stripping; pass the raw `propDef.default` through so numeric, boolean, and object defaults survive code generation.
- Special-case `defaultValue` in the Handlebars `json` helper to inject literal values without quoting, and to omit the property when the default is `"undefined"`.
