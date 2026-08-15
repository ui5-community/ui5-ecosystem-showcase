---
"ui5-tooling-transpile": minor
---

feat(ui5-tooling-transpile): add `useGlobPatterns` flag for glob `includes`/`excludes`

Adds a `useGlobPatterns` boolean option (default `false`). When enabled, the
`includes`/`excludes` options (and their `includePatterns`/`excludePatterns` aliases)
are matched as glob patterns via `minimatch` instead of the classic substring matching,
aligning the syntax with other UI5 tooling extensions (e.g. `ui5-task-zipper`). With the
flag enabled, patterns must be written as globs (e.g. `**/thirdparty/**`, `**/*.png`) and
the built-in image default excludes are globbed automatically. The default remains
substring matching, so existing configurations are unaffected.
