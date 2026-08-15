---
"ui5-task-copyright": minor
---

feat(ui5-task-copyright): add glob-based `includes`/`excludes` options

Adds `includes`/`excludes` configuration options that are matched via `minimatch`
glob patterns (e.g. `**/thirdparty/**`, `**/*.designtime.js`), aligning the option
naming and semantics with `ui5-task-zipper`. `excludes` wins over `includes`; when
`includes` is set, only matching resources get the copyright header. The existing
`excludePatterns` option keeps its classic substring behavior for backward compatibility.
