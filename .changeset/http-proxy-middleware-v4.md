---
"ui5-middleware-simpleproxy": minor
"ui5-middleware-approuter": minor
---

Upgrade `http-proxy-middleware` to v4. v4 ships as ESM-only and requires Node >= 22.15.0 (already the CI baseline). The exposed API surface used here (`target`, `changeOrigin`, `secure`, `agent`, `auth`, `headers`, `pathFilter`, `pathRewrite`, `selfHandleResponse`, `xfwd`, `autoRewrite`, `on.proxyReq`/`proxyRes`, `responseInterceptor`, `proxyMiddleware.upgrade`) is unchanged; the `require()` calls were switched to dynamic `await import()` inside the existing async scopes — same pattern already used for `proxy-from-env` and `https-proxy-agent`.
