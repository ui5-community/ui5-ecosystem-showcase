---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): resolve Node.js subpath imports (`#...` specifiers)

The module resolver now understands Node.js [subpath imports](https://nodejs.org/api/packages.html#subpath-imports):
a bare `#...` specifier is resolved against the **importing** module's
`package.json` `"imports"` field (unlike `"exports"`/`"browser"`, which resolve
against the imported package). Resolution targets the browser condition — the
`node` branch and build-only conditions (e.g. a `.ts`-source condition) are not
selected.

This unblocks bundling packages that switch their platform implementation via an
`"imports"` map, such as the OpenTelemetry JS v3 packages (`#platform`), which
previously left the literal `#platform` specifier in the generated bundle and
failed to load.
