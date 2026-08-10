---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): add `create-webc-controls` CLI to generate UI5 control wrappers from a custom-elements.json

Adds a standalone, dependency-invocable CLI (`create-webc-controls`) and a programmatic `generateControls()` API that process a custom elements manifest via the `WebComponentRegistry` and serialize the UI5 package glue plus one control wrapper per described class into an output folder. The generated UI5 namespace can be remapped independently from the npm package name (`ui5Namespace`) and a leading module path segment can be stripped (`stripModulePrefix`, e.g. `dist`), which enables generating wrappers for native HTML element packages such as `@ui5/html` under a target namespace like `sap.ui.core.html.elements`.
