---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): add `cascadedBuild` for sharing bundled modules across dependent libraries

Adds an opt-in `cascadedBuild` configuration option for scenarios where the same NPM package (e.g. `@ui5/webcomponents`) is bundled into multiple dependent UI5 libraries and applications (e.g. `sap.m` and `sap.f`). When enabled, each library writes an externals manifest (`.ui5-tooling-modules/externals-manifest.json`) listing the modules and Web Components packages it bundled together with their target UI5 module paths. Dependent libraries and applications that also enable `cascadedBuild` read these manifests and treat the already-bundled modules and packages — including the Web Components package/registration chunks — as externals, referencing the dependency's bundled paths instead of re-bundling them. This avoids duplicating shared framework code and re-registering custom elements. The task requires its dependencies to be built first (via `determineRequiredDependencies`) when the option is enabled, guaranteeing the manifests are available when read.

Details:

- Web Components wrappers that a library bundles itself, but whose npm package is owned by a dependency library, keep their own local `gen` namespace identity (control name / qualified namespace) while still importing the dependency's package for registration.
- XML view/fragment references are resolved per module, so controls that share one namespace prefix but originate from different owning libraries (a package split across libraries, e.g. `Button` from library A and `Input` from library B) each resolve to the correct owner via distinct namespace aliases.
- Applications that only consume Web Components already bundled by their dependency libraries no longer fail with an empty rollup input.
