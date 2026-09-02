# Cascaded Build Showcase

Demonstrates the **`cascadedBuild`** feature of [`ui5-tooling-modules`](../../packages/ui5-tooling-modules): sharing bundled NPM modules (and Web Components packages) across dependent UI5 libraries so they are not bundled more than once.

This showcase has two libraries:

| Library | Uses | Role |
|---------|------|------|
| [`ui5-cascaded-producer`](../ui5-cascaded-producer) | `@ui5/webcomponents/dist/Button` | **Producer** — bundles `@ui5/webcomponents` and writes an externals manifest |
| `ui5-cascaded-consumer` (this package) | `@ui5/webcomponents-fiori/dist/Search` | **Consumer** — depends on the producer; reuses its bundled `@ui5/webcomponents` |

`@ui5/webcomponents-fiori/dist/Search` internally reuses `@ui5/webcomponents` (e.g. `Button`) and `@ui5/webcomponents-base`. In addition, this consumer library uses `@ui5/webcomponents/dist/Input` — a module of the **same package** the producer owns, but one the producer did not bundle. Without cascaded builds, both libraries would bundle the shared modules. With `cascadedBuild: true`:

1. Building the **producer** writes `ui5-cascaded-producer/.ui5-tooling-modules/externals-manifest.json` listing the modules and Web Components packages it bundled, mapped to its own `gen` namespace.
2. Building the **consumer** reads that manifest (the producer is a declared dependency, so it is built first) and treats the shared `@ui5/webcomponents` package as an **external** — referencing `ui5/ecosystem/demo/cascaded/producer/gen/...` instead of re-bundling it. `Input` (not owned by the producer) is bundled locally, but reuses the producer's package registration.

## Test page

[`test/TestPage.html`](test/TestPage.html) + [`test/TestPage.js`](test/TestPage.js) instantiate the Web Component wrapper controls **imperatively** (`new Button(...)`, `new Input(...)`, `new Search(...)`) — Button from the producer, Input and Search from the consumer.

- `npm run dev` — serves from source; the `ui5-tooling-modules` middleware resolves the Web Components on the fly.
- `npm run start` — serves the build output (`ui5-dist.yaml`), i.e. the generated `gen` wrappers produced by the cascaded build.

## Build it

```sh
# from the monorepo root, after `pnpm install`
pnpm build-cascaded            # builds producer -> consumer -> app in order
# or individually:
pnpm build-cascaded-producer
pnpm build-cascaded-consumer
```

Then inspect:

- `showcases/ui5-cascaded-producer/.ui5-tooling-modules/externals-manifest.json` — the advertised `modules` and `packages`.
- `showcases/ui5-cascaded-consumer/dist/resources/ui5/ecosystem/demo/cascaded/consumer/gen/` — note the absence of the `@ui5/webcomponents` package chunk (only `@ui5/webcomponents-fiori` and the locally-owned `@ui5/webcomponents/dist/Input` are bundled), and that the generated code references `ui5/ecosystem/demo/cascaded/producer/gen/...` for the shared package.

See the `cascadedBuild` option in the [`ui5-tooling-modules` README](../../packages/ui5-tooling-modules/README.md#configuration-options-in-yourappui5yaml) for details, and the [`ui5-cascaded-app`](../ui5-cascaded-app) demo app that consumes all three controls.
