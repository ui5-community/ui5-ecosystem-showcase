---
"ui5-task-zipper": minor
---

feat(ui5-task-zipper): add `includes`/`excludes` glob filtering for the archive

The native `builder.resources.excludes` in `ui5.yaml` only filters *source* files
and cannot remove artifacts created during the build (source maps, `-dbg.js` debug
bundles). Two new configuration options let you shape the archive contents directly:

- **`excludes`**: glob patterns for build resources to omit from the archive, e.g.
  `**/*.map`, `**/*-dbg.js` — keeping production deployment archives lightweight.
- **`includes`**: glob patterns restricting the archive to an allow-list of
  resources, e.g. `Component.js`, `manifest.json`, `css/**`.

Patterns are matched via `minimatch`. Both options accept `includePatterns` /
`excludePatterns` as backward-compatible aliases (following the ui5-tooling-transpile
naming convention). `excludes` wins over `includes`, and `additionalFiles` are not
affected by the patterns.
