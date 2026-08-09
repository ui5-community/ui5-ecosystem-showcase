---
"ui5-middleware-livereload": minor
---

feat(ui5-middleware-livereload): auto-disable under UI5 Tooling V5+ with a `force` override

UI5 Tooling **V5** ships a built-in Live Reload; running this middleware alongside
it makes the page reload more often than necessary. The middleware now **detects
UI5 Tooling V5 or higher** (via the running `@ui5/server` major version) and
**auto-disables itself** there to avoid double reloads.

A new `configuration.force` option overrides the automatic behavior in both
directions:

- `force: true` keeps the middleware active under V5+ (disable the built-in Live
  Reload via `--no-live-reload` or `server.settings.liveReload` to avoid a
  double reload)
- `force: false` disables the middleware on any tooling version

When the tooling version cannot be detected, the middleware fails open (stays
enabled) so existing setups keep working.
