# TypeScript UI5 library showcase

This sample shows a TypeScript setup for developing a UI5 library, including dev server, build, linting, type checking, JSDoc generation, and Karma-based unit tests.

Peek at both [`ui5.yaml`](ui5.yaml) and [`package.json`](package.json) in order to learn about the UI5 CLI configuration and its' `npm` package dependencies and configuration options.

## Getting started

From the repository root (after a one-time `pnpm install`):

```bash
pnpm dev-lib:ts         # run the UI5 dev server (opens the example page on http://localhost:8080)
pnpm build-lib:ts       # build the library to ./dist
```

Or from inside this folder:

```bash
pnpm dev                # dev server
pnpm build              # build to ./dist
pnpm start              # serve the built ./dist via ui5-dist.yaml
pnpm ts-typecheck       # TypeScript type-check only (no emit)
pnpm testsuite          # open the QUnit testsuite in the browser
pnpm test               # lint + Karma headless tests with coverage
pnpm jsdoc              # generate JSDoc output
```

## License

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
