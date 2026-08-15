---
"ui5-middleware-simpleproxy": minor
---

feat(ui5-middleware-simpleproxy): add `includes`/`excludes` glob options

Adds `excludes` (a glob-syntax alias of the pre-existing `excludePatterns`) and a new
`includes` option, both matched via `minimatch`, aligning the option naming with
`ui5-task-zipper`. When `includes` is set, only matching request paths are proxied;
`excludes`/`excludePatterns` still take precedence. The behavior of the existing
`excludePatterns` option is unchanged (it was already glob-based).
