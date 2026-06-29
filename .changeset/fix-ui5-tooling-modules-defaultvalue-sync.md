---
"ui5-tooling-modules": patch
---

Sync `defaultValue` serialization between `rollup-plugin-webcomponents` and the Handlebars `json` helper so the generated UI5 metadata is identical regardless of code path.

- In `rollup-plugin-webcomponents`, pass a replacer to `JSON.stringify` that mirrors the Handlebars helper: drop `undefined`/`"undefined"` defaults, keep `""` as-is, and `JSON.parse` everything else so booleans, numbers, objects, and quoted strings come out as proper JSON values (e.g. `true` instead of `"true"`, `"Button"` instead of `'"Button"'`).
- Drop non-parseable values with a warning instead of emitting invalid JSON.
- Added cross-reference comments on both sides to keep the two implementations in sync.
