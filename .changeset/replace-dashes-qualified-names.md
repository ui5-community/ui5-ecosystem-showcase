---
"ui5-tooling-modules": minor
---

feat: add `replaceDashes` option and consistently apply name-sanitization to generated UI5 qualified names

Introduces a new standalone `replaceDashes` boolean option (task-only) that replaces dashes with underscores in module paths when using `addToNamespace`. The `sanitizeNpmPackageName` master flag now explicitly enables both `removeScopePrefix` **and** `replaceDashes`.

Both flags are now forwarded into the Web Components plugin so the `WebComponentRegistry` applies the same transformations to the generated UI5 qualified names (`.extend("...")` calls) as `rewriteDep` applies to module paths — keeping class names and file paths in sync (e.g. `webc-package.MyControl` → `webc_package.MyControl`).

The deprecated alias `removeScopePreceder` for `removeScopePrefix` continues to be accepted.
