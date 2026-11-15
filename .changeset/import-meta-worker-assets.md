---
"ui5-tooling-modules": patch
---

Fix `new URL(..., import.meta.url)` asset handling when resolved IDs have no query suffix, avoiding an empty-path ENOENT. Emit `.mjs` and `.cjs` JavaScript assets with a `.js` filename and use that same filename in the generated URL, preventing double-dot resource names and mismatched worker URLs.
