---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): preserve npm package name in `_ui5metadata.name` during rewriting

The `replaceParam` helper used during post-generation module rewriting was replacing all
occurrences of the npm package name in the generated code — including the `name` property
value inside the `_ui5metadata` object. This caused the library descriptor's `name` field
to be rewritten to a UI5 module path instead of keeping the original npm package name
(e.g. `"@ui5/webcomponents-geomap"`).

The fix protects the `name` value via a placeholder before the replacement pass and
restores it afterwards. The regex matches both the quoted (`"name":`) and unquoted (`name:`)
key forms, since prettier reformats the object literal to use unquoted keys.
