---
"ui5-task-minify-xml": minor
---

feat(ui5-task-minify-xml): add glob-based `includes`/`excludes` options

Adds `includes`/`excludes` configuration options that are matched via `minimatch`
glob patterns (e.g. `**/thirdparty/**`, `**/*.fragment.xml`), aligning the option
naming and semantics with `ui5-task-zipper`. `excludes` wins over `includes`; when
`includes` is set, only matching resources are minified. The existing `excludePatterns`
option keeps its classic substring behavior for backward compatibility.
