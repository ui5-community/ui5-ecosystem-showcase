# Showcase for the `dev-approuter`

This showcase demonstrates the [`dev-approuter`](../../packages/dev-approuter/README.md), a dev time wrapper for the [SAP Application Router](https://www.npmjs.com/package/@sap/approuter) that can serve UI5 and SAP CDS apps added as `devDependencies`.

Peek at [`package.json`](package.json) and the `xs-app.json`/`xs-dev.json` files in this folder to learn how the approuter is configured and which UI5/CDS apps are wired in as dev dependencies.

## Getting started

From the repository root (after a one-time `pnpm install`):

```bash
pnpm dev-approuter      # run via the dev-approuter wrapper (recommended for development)
pnpm start-approuter    # run via the plain @sap/approuter, mimicking productive setup
```

The approuter listens on port `5000` by default. Set `PORT=…` (or a `default-env.json`) to change it.

## License

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
