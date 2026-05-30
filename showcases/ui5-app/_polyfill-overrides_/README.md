# Polyfill Overrides

Per-project escape hatch for `ui5-tooling-modules`'s Node-builtin polyfills.

Drop a `<module>.js` file here (e.g. `path.js`, `crypto.js`) and `ui5-tooling-modules` will load that file instead of the polyfill that `rollup-plugin-polyfill-node` would otherwise inject during bundling. Useful when a transitive dependency imports a named export the upstream polyfill does not provide and the gap is too app-specific for `POLYFILL_AUGMENTATIONS` in [`packages/ui5-tooling-modules/lib/rollup-plugin-polyfill-node-override.js`](../../../packages/ui5-tooling-modules/lib/rollup-plugin-polyfill-node-override.js).

This directory is intentionally empty. The `node:util` `TextEncoder` / `TextDecoder` exports needed by `cmis -> sax` are now appended automatically through the augmentation mechanism in `ui5-tooling-modules`, so no per-app file is required for them anymore.
