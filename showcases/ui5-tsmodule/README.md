# TypeScript UI5 module showcase

This sample shows a TypeScript UI5 module that can be consumed by UI5 apps via the [`ui5-tooling-modules`](../../packages/ui5-tooling-modules/README.md) extension.

Peek at [`package.json`](package.json) and the source files in this folder to learn how the module is shaped and exported.

## Getting started

After a one-time `pnpm install` at the repository root, the module is linked into consuming showcases automatically. To compile the TypeScript sources or lint locally, run from inside this folder:

```bash
pnpm build              # compile TypeScript via tsc
pnpm lint               # run eslint
```

A consuming showcase such as [`ui5-tsapp`](../ui5-tsapp/README.md) will pick this module up via pnpm's workspace linking — start it from the repository root with `pnpm dev:ts`.

## License

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
