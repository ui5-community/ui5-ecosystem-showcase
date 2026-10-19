---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): restore rewriting of slashed qualified names in Web Component wrappers

When `replaceDashes`/`removeScopePrefix`/`sanitizeNpmPackageName` is active, the generator now
emits sanitized slashed qualified names (e.g. `ui5/webcomponents_fiori`).  The post-processing
rewrite loop in `util.js` was only searching for the raw npm package name
(`@ui5/webcomponents-fiori`) in slashed positions, so `designtime` paths and
`@alias`/`@type module:` JSDoc comments were no longer prefixed with the project namespace.

Adds a slashed-sanitized search pass (guarded against the no-sanitization default so output is
byte-identical when sanitization flags are off) ordered before the raw-name pass to prevent
double-prefixing.
