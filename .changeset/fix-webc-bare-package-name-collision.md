---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): prevent substitute collision when bare package name resolves directly to a component

For Web Component packages whose `package.json` `exports["."]` (or `main`/`module`) points
directly at a single component file (e.g. `@ui5/webcomponents-geomap`), importing the bare
package name caused a collision: the substitute mechanism claimed the package-level module slot
(`@ui5/webcomponents-geomap.js`) before the UI5 library descriptor could be written there,
resulting in an empty/missing library descriptor and a confusing substitute warning.

`lookupWebComponentsClass` now short-circuits when `source === npmPackage` (bare package name,
no sub-path), returning `undefined` so the package-level resolver handles the slot correctly.
An actionable error is logged telling the consumer which explicit sub-path to use instead.
