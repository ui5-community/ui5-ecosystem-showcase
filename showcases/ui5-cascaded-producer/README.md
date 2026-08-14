# Cascaded Build Showcase — Producer

Producer library for the [cascaded build](../ui5-cascaded-consumer/README.md) showcase of [`ui5-tooling-modules`](../../packages/ui5-tooling-modules).

This library bundles `@ui5/webcomponents/dist/Button`. Built with `cascadedBuild: true`, it writes an externals manifest to `.ui5-tooling-modules/externals-manifest.json` advertising the bundled modules and the `@ui5/webcomponents` Web Components package (incl. its registration chunk) at its own `gen` namespace. The [consumer library](../ui5-cascaded-consumer) reuses these instead of re-bundling them.

## Run it

```sh
# from the monorepo root, after `pnpm install`
pnpm --filter ui5-cascaded-producer build
```

Then inspect `showcases/ui5-cascaded-producer/.ui5-tooling-modules/externals-manifest.json`.
