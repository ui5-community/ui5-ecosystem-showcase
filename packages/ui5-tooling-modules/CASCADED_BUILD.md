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

Each library with `cascadedBuild: true` writes a `library-externals-manifest.json` into its library namespace (next to `library.js`, `.library`, …):

```json
{
  "libraryName": "ui5.ecosystem.demo.cascaded.producer",
  "libraryNamespace": "ui5/ecosystem/demo/cascaded/producer",
  "packageVersions": {
    "@ui5/webcomponents": "2.23.1",
    "@ui5/webcomponents-base": "2.23.1"
  },
  "modules": {
    "@ui5/webcomponents/dist/Button": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents/dist/Button"
  },
  "packages": {
    "@ui5/webcomponents-base": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents-base",
    "@ui5/webcomponents": "ui5/ecosystem/demo/cascaded/producer/gen/@ui5/webcomponents"
  }
}
```

- **`packageVersions`** — the installed versions of the shared npm packages this library bundled. A dependent that reuses these externals references this library's *already-compiled* code, so it must resolve the exact same package version; the consumer verifies this before reusing (see [Version consistency](#version-consistency)).
- **`modules`** — genuine, importable module entries this library bundled, mapped to their UI5 AMD (`gen`) paths. Internal rollup chunk names are intentionally not advertised (they are not valid import specifiers for dependents).
- **`packages`** — Web Components packages (including their registration chunk) this library bundled, so a dependent can reuse the registration instead of re-registering the custom elements. `libraryName` / `libraryNamespace` are written for traceability (`libraryName` is used in the version-mismatch warning).

**Where the manifest lives.** The manifest data is produced in `getBundleInfo` and exposed on the `BundleInfo` (`getExternalsManifest()`); the task writes it into the UI5 **workspace** at `/resources/<namespace>/library-externals-manifest.json`, alongside the other `library-*` artifacts. It therefore ships inside `dist/` and the published npm package. Dependents read it through the dependency's **reader** (`byPath`), which resolves both a **built / npm-installed** library and — in a single-run build graph (e.g. an application building its library dependencies) — the freshly built dependency output. No on-disk source-root copy is needed.

Only **library** projects write a manifest — nothing depends on an application, so apps consume manifests but never produce one.

### Build order

Cascaded builds require the dependency libraries to be built first (so their manifests exist). This is guaranteed by `determineRequiredDependencies` in [task.js](lib/task.js): when `cascadedBuild` is enabled it returns the available dependencies (otherwise an empty set), so UI5 CLI builds them ahead of the current project.

### Dependency discovery & manifest loading

`task.js` computes `libraryDeps` from `taskUtil.getDependencies()` — deliberately **including framework projects** (in OpenUI5, dependent libraries *are* framework projects), which the regular `depPaths` computation excludes. Each entry carries `{ name, namespace, rootPath, reader }`. The task then loads each dependency's manifest through the dependency **reader** (`/resources/<dep-namespace>/library-externals-manifest.json`). The loaded manifests are passed into `getBundleInfo`, which runs the version check and merges the externals.

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

### Version consistency

Because a dependent references the dependency's *already-compiled* code for a shared npm package, both sides must build against the **same version** of that package — otherwise the reused bundle is compiled against the wrong version. When loading a dependency's manifest, `getBundleInfo` compares each entry in `packageVersions` against the version this project resolves from its own `node_modules` (`getNpmPackageVersion` → `resolveModule("<pkg>/package.json")` → `getPackageJson().version`), using `semver.eq` for **exact** equality. On any mismatch it emits a `log.warn` (naming the dependency library, package, and expected vs. actual version) and **skips that manifest's externals entirely**, so the consumer re-bundles those modules locally instead of referencing an incompatible bundle. Manifests without `packageVersions` (older builds) skip the check and behave as before.

### Cache isolation

The same entry modules produce a *different* bundle depending on which modules/packages are externalized to a dependency. The `BundleInfoCache` key therefore includes a fingerprint of the loaded externals (`{ modules, packages }`) alongside the tool/config/lockfile/entry-graph fingerprints — without it, two projects bundling the same entries (e.g. an app and a library both handling `Search`/`Input`) would collide on the in-memory cache and wrongly reuse each other's output.

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

1. Build the libraries (`npm run build` in producer, then consumer) and confirm each ships `dist/resources/<namespace>/library-externals-manifest.json` (next to `library.js`), with the expected `packageVersions` / `modules` / `packages`. No manifest is written to the source root.
2. Build `ui5-cascaded-app`; confirm its output bundles no Web Components itself (no `dist/thirdparty`) and references the libraries' `gen` paths, with all `define()` dependencies resolvable (no 404s). The app writes no manifest of its own.
3. Version mismatch: inject a differing `packageVersions` entry (unit test `Cascaded build: version mismatch skips the dependency's externals`, or hand-edit a manifest) and confirm the `log.warn` fires and the modules are re-bundled locally instead of externalized.
4. Dev/middleware mode: run `npm run dev` in `ui5-cascaded-app`; the Button/Input/Search render, with no `.js.js` requests and no raw ESM `import` statements in served modules.
5. Regression: non-cascaded webc output (e.g. `ui5-tsapp-webc`) is unchanged; `ui5-tsapp` (which uses `chart.js`) still loads Chart.js in dev with its package-name suffix preserved.
6. `cd packages/ui5-tooling-modules && npm test`.

## Key files

| File | Role in cascaded build |
| ---- | ---------------------- |
| [lib/task.js](lib/task.js) | `cascadedBuild` config, `libraryDeps` discovery (incl. framework projects + reader), manifest loading via the dependency reader, manifest write into the workspace as `library-externals-manifest.json` (libraries only), `determineRequiredDependencies`, `rewriteDep`, `rewriteJSDeps`, `rewriteXMLDeps` |
| [lib/util.js](lib/util.js) | `getBundleInfo` (build manifest incl. `packageVersions` onto the `BundleInfo`, version-consistency check + skip-on-mismatch, externals in the cache key, rewrite wrapper code, middleware suffix strip), `createBundle` (`filterForExternalModules`), `getNpmPackageVersion`, `BundleInfo` externals/manifest accessors |
| [lib/rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js) | Honors `filterForExternalModules` (defaults to `() => false` outside cascaded context) |
