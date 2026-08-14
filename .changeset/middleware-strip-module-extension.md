---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): strip module extension from AMD dependencies in the middleware

When the middleware generates the UI5 AMD modules on the fly, rollup emits the dependency specifiers of the `sap.ui.define([...])` / `require([...])` calls verbatim, keeping the original file extension on bare NPM specifiers (e.g. `@ui5/webcomponents-base/dist/Device.js`). As the ui5loader appends `.js` itself, those dependencies were requested with a doubled suffix (`.../Device.js.js`), returned a 404, and the raw ES module was served instead — failing at runtime with `Cannot use import statement outside a module`. The middleware now strips the trailing `.js`/`.mjs`/`.cjs` from the specifiers inside the loader dependency arrays so they resolve correctly.

The extension is kept when it is part of the NPM package name itself (e.g. `chart.js`, `easytimer.js`), because such a module is served as `<namespace>/thirdparty/chart.js.js` and its module name genuinely is `chart.js` — mirroring the existing scan-time handling. The build output is unaffected (the extension is already removed there when the dependencies are rewritten into the project namespace).
