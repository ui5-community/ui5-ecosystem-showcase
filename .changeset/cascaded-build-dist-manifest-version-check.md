---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): ship cascaded externals manifest in dist and verify shared package versions

The cascaded build now works when the dependency library is consumed as a built / npm-installed package, and it guards against version drift of the shared npm packages:

- The externals manifest is written into the UI5 workspace so it ships inside `dist/` (and the published package) as `library-externals-manifest.json` in the library namespace (next to `library.js`). Dependents read it through the dependency reader, which resolves both built / npm-installed libraries and the freshly built dependency output in a single-run build graph. Only library projects write a manifest; applications consume but never produce one.
- The manifest records the installed versions of the shared npm packages (`packageVersions`). When a dependent reuses these externals it references the dependency's already-compiled code, so the consumer now verifies it resolves the exact same version (`semver.eq`); on a mismatch it logs a warning and skips that dependency's externals, re-bundling the modules locally instead.
- The bundle cache key now includes the loaded externals, so two projects bundling the same entry modules (e.g. an app and a library both handling the same Web Components) no longer collide in the in-memory `BundleInfoCache` and reuse each other's output.
