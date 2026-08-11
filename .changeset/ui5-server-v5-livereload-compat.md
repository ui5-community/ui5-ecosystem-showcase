---
"ui5-middleware-ui5": patch
"cds-plugin-ui5": patch
---

Pass an explicit `liveReload` option when constructing `@ui5/server`'s `MiddlewareManager`, preventing a startup crash (`Cannot read properties of undefined (reading 'active')`) when running on `@ui5/server` v5. The v5 server supplies the `liveReload` default only via a function default parameter, which is bypassed by the explicit `options` object passed here. No effect on `@ui5/server` v4.
