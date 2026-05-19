# UI5 module showcase

This sample shows a UI5 module providing a custom control packaged as an NPM package. The module is consumed by other showcases (e.g. [`ui5-app`](../ui5-app/README.md)) via the [`ui5-tooling-modules`](../../packages/ui5-tooling-modules/README.md) extension.

Peek at [`package.json`](package.json) and the source files in this folder to learn how the custom control is shaped and exported.

## Getting started

This module has no own dev server or build step — it is consumed in source form by other showcases through pnpm's workspace linking. After a one-time `pnpm install` at the repository root, simply run a consuming showcase, e.g.:

```bash
pnpm dev          # runs the ui5-app showcase, which uses this module
```

To lint the sources locally:

```bash
pnpm lint
```

## License

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
