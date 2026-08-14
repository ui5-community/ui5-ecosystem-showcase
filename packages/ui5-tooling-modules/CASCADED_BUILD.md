# Cascaded Builds for `ui5-tooling-modules`

## Context

In OpenUI5, `@ui5/webcomponents` must be integrated into multiple libraries (e.g. `sap.m`, `sap.f`). Without coordination, each library re-bundles the same shared framework dependencies (`@ui5/webcomponents-base`, etc.), causing duplicate code, larger bundles, and — for Web Components — the same custom elements being registered more than once.

**Goal:** when a dependency library (e.g. `sap.m`) has already bundled `@ui5/webcomponents/dist/Button` and its framework dependencies, a dependent library or application (e.g. `sap.f`, or an app consuming both) should treat those already-bundled modules and Web Components packages as **Rollup externals** and reference the owning library's generated (`gen`) wrapper path instead of re-bundling them.

## Enabling it

Opt-in per project via `ui5.yaml`:

```yaml
builder:
  customTasks:
    - name: ui5-tooling-modules-task
      afterTask: replaceVersion
      configuration:
        cascadedBuild: true
```

When enabled, the task both **reads** the externals manifests of its dependency libraries and **writes** its own manifest for downstream dependents.

## How it works

### Externals manifest

Each library with `cascadedBuild: true` writes `<library-root>/.ui5-tooling-modules/externals-manifest.json`:

```json
{
  "libraryName": "ui5.ecosystem.demo.cascaded.producer",
  "libraryNamespace": "ui5/ecosystem/demo/cascaded/producer",
  "modules": {
    "@ui5/webcomponents/dist/Button": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents/dist/Button"
  },
  "packages": {
    "@ui5/webcomponents-base": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents-base",
    "@ui5/webcomponents": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents"
  }
}
```

- **`modules`** — genuine, importable module entries this library bundled, mapped to their UI5 AMD (`gen`) paths. Internal rollup chunk names are intentionally not advertised (they are not valid import specifiers for dependents).
- **`packages`** — Web Components packages (including their registration chunk) this library bundled, so a dependent can reuse the registration instead of re-registering the custom elements. `libraryName` / `libraryNamespace` are written for traceability but not read back.

Manifests are written to the **library root**, not into `node_modules` — the root is stable and writable, follows the existing `.ui5-tooling-modules/` convention (as used by `BundleInfoCache`), and requires no `node_modules` mutation. The write is `await`ed so a dependent build never starts before the manifest is complete.

### Build order

Cascaded builds require the dependency libraries to be built first (so their manifests exist). This is guaranteed by `determineRequiredDependencies` in [task.js](lib/task.js): when `cascadedBuild` is enabled it returns the available dependencies (otherwise an empty set), so UI5 CLI builds them ahead of the current project.

### Dependency discovery

`task.js` computes `libraryDeps` from `taskUtil.getDependencies()` — deliberately **including framework projects** (in OpenUI5, dependent libraries *are* framework projects), which the regular `depPaths` computation excludes. Each entry is `{ name, namespace, rootPath }`; the manifests are then read in `getBundleInfo` from each `rootPath`.

### Externals detection is per-module, never per-package-blanket

`filterForExternalModules` in [util.js](lib/util.js) `createBundle` marks a module external only if:

- it appears in a dependency manifest's `modules` (module-level external → mapped to the exact bundled path), or
- it is the **bare package import** of a package in `packages` (package-level external → only the registration chunk is redirected).

Package externals use an "exact" boundary so that a subpath of a dependency-owned package (e.g. `@ui5/webcomponents/dist/Input`) can still be bundled locally even though the package `@ui5/webcomponents` itself is owned by a dependency. This is the split-package case: within one app, `Button` may be owned by library A and `Input` by library B under the same npm package.

### Per-module XML resolution

`rewriteXMLDeps` in [task.js](lib/task.js) resolves each XML element individually. Because a single `xmlns:webc="@ui5/webcomponents/dist"` prefix cannot express a package split across owners, each distinct resolved owner namespace gets a synthesized alias (`wc0`, `wc1`, …) injected on the root element, and the element is renamed to the aliased prefix. This is gated on externals being present, so non-cascaded XML output is byte-identical.

### Code rewriting

For generated wrappers, `getBundleInfo` rewrites:

- the wrapper's own identity into this project's namespace (`gen/...`),
- external module/package references to the owner library's bundled path (via `replaceModules` / `replaceJSDoc`, using a negative-lookahead boundary so `@ui5/webcomponents` never matches `@ui5/webcomponents-base`),
- dotted references to externalized package data-type enums to the owner's dotted namespace.

A control the consumer bundles itself but whose *package* is external (e.g. `Input`) keeps its own local `gen` identity while the package registration import stays external.

## Middleware (dev server) support

The build path rewrites AMD dependency specifiers into the project namespace (which also removes the file extension). The **middleware** serves the generated modules as-is and does **not** run that rewrite, so rollup's verbatim dependency specifiers kept their extension on bare npm specifiers (e.g. `@ui5/webcomponents-base/dist/Device.js`). Since the ui5loader appends `.js` itself, those resolved to `…/Device.js.js` (404) and the raw ES module was served instead, failing with *"Cannot use import statement outside a module"*.

A middleware-only `stripModuleExtensions` pass in `getBundleInfo` now removes a trailing `.js`/`.mjs`/`.cjs` from the specifiers inside `sap.ui.define([...])` / `require([...])` dependency arrays. It is gated on `isMiddleware`, so build output is unchanged. Critically, the extension is **kept** when it is part of the npm package name itself (e.g. `chart.js`, `easytimer.js`) — detected via `getNpmPackageName(specifier) === specifier`, mirroring the scan-time `moduleNameEqualsNpmPackageName` handling — because such a module is genuinely served as `chart.js.js`. By the time this pass runs, internal chunks are already relativized to `./X`, so it only ever sees bare npm specifiers.

> Note: the middleware does not consume the cascaded externals (no `libraryDeps` / `rewriteDep`); in dev each project serves self-contained modules resolved from `node_modules`. Only the build path performs cascaded externalization. The suffix strip is what makes the served modules loadable.

## Showcases

Runnable end-to-end example under `showcases/`:

- **`ui5-cascaded-producer`** — library that bundles `Button` (`@ui5/webcomponents`).
- **`ui5-cascaded-consumer`** — depends on the producer; bundles `Search` (`@ui5/webcomponents-fiori`) and `Input`. `Input` is the same npm package as the producer's `Button`, but a module the producer did **not** bundle, so it is owned by the consumer while the `@ui5/webcomponents` package registration is reused from the producer.
- **`ui5-cascaded-app`** — application consuming all three; bundles zero Web Components itself, reusing the libraries' bundles.

Build artifacts and manifests are gitignored.

## Verification

1. Build the libraries (`npm run build` in producer, then consumer) and confirm each writes `.ui5-tooling-modules/externals-manifest.json` with the expected `modules` / `packages`.
2. Build `ui5-cascaded-app`; confirm its output bundles no Web Components itself and references the libraries' `gen` paths, with all `define()` dependencies resolvable (no 404s).
3. Dev/middleware mode: run `npm run dev` in `ui5-cascaded-app`; the Button/Input/Search render, with no `.js.js` requests and no raw ESM `import` statements in served modules.
4. Regression: non-cascaded webc output (e.g. `ui5-tsapp-webc`) is unchanged; `ui5-tsapp` (which uses `chart.js`) still loads Chart.js in dev with its package-name suffix preserved.
5. `cd packages/ui5-tooling-modules && npm test`.

## Key files

| File | Role in cascaded build |
| ---- | ---------------------- |
| [lib/task.js](lib/task.js) | `cascadedBuild` config, `libraryDeps` discovery (incl. framework projects), `determineRequiredDependencies`, `rewriteDep`, `rewriteJSDeps`, `rewriteXMLDeps` |
| [lib/util.js](lib/util.js) | `getBundleInfo` (load/write manifests, expose externals, rewrite wrapper code, middleware suffix strip), `createBundle` (`filterForExternalModules`), `BundleInfo` externals accessors |
| [lib/rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js) | Honors `filterForExternalModules` (defaults to `() => false` outside cascaded context) |
