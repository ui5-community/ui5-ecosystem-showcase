---
"ui5-tooling-modules": patch
---

Augment the bundled `node:util` polyfill with `TextEncoder` / `TextDecoder` exports out of the box (previously consumers had to drop a 720-line `_polyfill-overrides_/util.js` copy of the upstream polyfill into every app). Augmentations are registered via a `POLYFILL_AUGMENTATIONS` map keyed by Node built-in name; entries are appended verbatim to the upstream polyfill source as the bundler loads it, and tree-shaking strips appended exports that nothing imports. Per-project `_polyfill-overrides_/` directories remain available for app-specific overrides that should not become global defaults.
