---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): respond with an error instead of an empty 200 when bundling failed

When the bundling failed, the module entries registered before bundling stayed in the bundle info without code, and the middleware served them as HTTP 200 with an empty body. The UI5 loader then resolved the module as `undefined` and the app failed far away from the cause. The middleware now responds with HTTP 500 and the bundling error message, so the failure is visible in the browser's network tab.
