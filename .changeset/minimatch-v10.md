---
"ui5-middleware-simpleproxy": patch
"ui5-tooling-modules": patch
"ui5-tooling-stringreplace": patch
---

Bump `minimatch` from v7 to v10. v9 dropped the default export, so the five `require("minimatch")` sites were switched to the named export `const { minimatch } = require("minimatch")`. The runtime call shape `minimatch(path, pattern)` is unchanged. minimatch 8 raised the Node floor to 20+, which already matches the workspace engines (Node 22 in CI).
