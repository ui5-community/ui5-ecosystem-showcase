---
"ui5-tooling-modules": patch
---

Fix recognition of native (non-UI5) Web Components whose components extend `HTMLElement` directly instead of `UI5Element` (regression since `3.36.0`, [#1410](https://github.com/ui5-community/ui5-ecosystem-showcase/issues/1410)).

- Guard the superclass lookup in `WebComponentRegistry#connectSuperclass` against an undefined `superclassLookupName` (`?.startsWith`), which previously crashed with `Cannot read properties of undefined (reading 'startsWith')` for web components without a resolvable superclass.
- In `rollup-plugin-webcomponents`, treat a custom element without a UI5 superclass as a *native* Web Component: load only the component module itself instead of prepending an `import` of the package or of `@ui5/webcomponents-base` (which such components neither need nor understand — no scoping or package runtime is required). The generated UI5 control wrapper imports the `WebComponent` base class accordingly and skips the JSDoc superclass serialization when the superclass metadata is missing.
- Add a `webc-package` showcase (a plain `HTMLElement`-based `CustomAlertButton` with a Custom Elements Manifest) plus a regression test and snapshot, and consume it from the `ui5-tsapp` showcase.
