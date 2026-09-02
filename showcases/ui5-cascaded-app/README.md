# Cascaded Build Showcase — Demo App

The demo application for the [cascaded build](../ui5-cascaded-consumer/README.md) feature of [`ui5-tooling-modules`](../../packages/ui5-tooling-modules). It consumes both libraries and demonstrates how Web Components are shared across a dependency chain instead of being bundled repeatedly.

## The dependency chain

```
ui5-cascaded-producer   bundles  @ui5/webcomponents/dist/Button      (owns @ui5/webcomponents package)
        ▲
        │ depends on
ui5-cascaded-consumer   bundles  @ui5/webcomponents-fiori/dist/Search (owns @ui5/webcomponents-fiori package)
                        bundles  @ui5/webcomponents/dist/Input        (module the producer did NOT bundle)
        ▲
        │ depends on
ui5-cascaded-app        uses     Button + Search + Input
```

## What the cascading does

- **Button** — bundled once by the **producer**. The consumer and the app reference the producer's `.../cascaded/producer/gen/...` path.
- **Search** — bundled by the **consumer** (`@ui5/webcomponents-fiori`, a different package than the producer owns).
- **Input** — the interesting case: it lives in `@ui5/webcomponents`, the *same package the producer owns at package level*, but the producer only bundled `Button`. So:
  - the shared `@ui5/webcomponents` package/registration chunk is **not** re-bundled by the consumer (reused from the producer),
  - but `@ui5/webcomponents/dist/Input` itself **is** bundled by the consumer, since the producer never advertised it.
- The **app** bundles none of these Web Components itself — with `cascadedBuild: true` it references the versions already bundled by the two libraries.

## Run it

```sh
# from the monorepo root, after `pnpm install`
pnpm --filter ui5-cascaded-producer build
pnpm --filter ui5-cascaded-consumer build
pnpm --filter ui5-cascaded-app build

# or serve it (dev)
pnpm --filter ui5-cascaded-app dev
```

Then inspect the app's `dist/resources/ui5/ecosystem/demo/cascaded/app/` — the Web Components are referenced at the producer/consumer paths rather than re-bundled locally.
