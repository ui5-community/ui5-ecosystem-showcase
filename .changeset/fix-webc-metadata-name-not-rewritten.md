---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): add `npmPackage` to `_ui5metadata` with the original npm package name

The `_ui5metadata.name` field holds the UI5 library namespace (e.g.
`"ui5/ecosystem/demo/app/thirdparty/webcomponents"`) — this is correct and needed by
the UI5 runtime. However, there was no way to trace a generated package module back to
its original npm package name.

This fix adds an `npmPackage` property to `_ui5metadata` that always holds the original
npm package name (e.g. `"@ui5/webcomponents"`), even when `replaceDashes` or namespace
remapping rewrites all other occurrences of that string in the generated code.
