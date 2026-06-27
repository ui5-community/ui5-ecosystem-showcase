---
"ui5-tooling-modules": patch
---

Detect custom Web Components via a new `WebComponentRegistryHelper.isCustomElement(classDef)` predicate that walks the full superclass chain (skipping the `UI5Element` base class itself, which is paradoxically flagged as a custom element in the metadata). Replaces an inlined check in `rollup-plugin-webcomponents.js` whose hand-rolled superclass walk only looked at the direct superclass and could loop on a `const`-bound class reference. When a class is recognized as a custom element only via inheritance, a warning is now logged so the upstream `custom-elements.json` can be fixed to flag the subclass directly.
