# ui5-middleware-hmr

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
