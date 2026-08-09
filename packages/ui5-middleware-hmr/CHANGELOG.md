# ui5-middleware-hmr

## 0.1.0

### Minor Changes

- [#1422](https://github.com/ui5-community/ui5-ecosystem-showcase/pull/1422) [`1411b16`](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/1411b16f24a850b6e71495616c415f3d9da69e55) Thanks [@petermuessig](https://github.com/petermuessig)! - feat(ui5-middleware-hmr): first feature release of the experimental HMR middleware

  `ui5-middleware-hmr` performs **hot module replacement** of `webapp` sources on
  change instead of a full-page live reload — reloading only what changed while
  preserving as much application state (route, models, open dialogs) as possible.

  Highlights:
  - CSS, i18n (`.properties`) and JSON model hot-refresh with no reload
  - leaf module + transitive dependent unload/re-require (static dependency graph)
  - controller changes re-instantiate the owning view(s) in place
  - **XML views and JS views** (TypedView and classic JSView) hot-swap in place;
    routed targets are refreshed through the router with the active route preserved
  - Component / root-view changes rebuild the Component in place
  - resilient lifecycle: the websocket server and file watcher are torn down on
    process exit, a websocket error no longer crashes the dev server, invalid
    `exclusions` patterns are skipped with a warning, and the page reloads once on
    reconnect after a dev-server restart
  - honest full-reload fallback whenever an in-place strategy isn't available

  > Experimental: relies on the private, deprecated `sap.ui.loader._.unloadResources`
  > API and internal control/registry behavior. Intended for local development only
  > and may break across UI5 versions; it feature-detects the API and degrades to a
  > full reload when unavailable. JSON and HTML views are not covered and full-reload.

## 0.0.1

### Patch Changes

- [#1420](https://github.com/ui5-community/ui5-ecosystem-showcase/pull/1420) [`d9100fa`](https://github.com/ui5-community/ui5-ecosystem-showcase/commit/d9100fad9f8181467801178bcea3b31073077e69) Thanks [@petermuessig](https://github.com/petermuessig)! - chore(ui5-middleware-hmr): bootstrap initial publish (0.0.1)

  Initial bootstrap release to establish the `ui5-middleware-hmr` package on the
  npm registry so that npm OIDC trusted publishing can be configured for it (the
  very first publish of a new package name cannot use OIDC). The feature-complete
  `0.1.0` release follows once trusted publishing is set up.

  `ui5-middleware-hmr` is an **experimental** UI5 CLI server middleware that
  performs hot module replacement of `webapp` sources on change instead of a
  full-page live reload. See the README for the full behavior matrix and caveats.
