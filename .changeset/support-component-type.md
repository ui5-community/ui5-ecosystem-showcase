---
"cds-plugin-ui5": patch
"ui5-middleware-ui5": patch
---

Recognize UI5 projects with `type: component` (introduced in UI5 CLI v5) alongside `type: application` when discovering UI5 modules in [findUI5Modules.js](packages/cds-plugin-ui5/lib/findUI5Modules.js). Fixes [#1392](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/1392).
