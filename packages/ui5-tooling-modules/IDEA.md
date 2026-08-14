# Cascaded Builds for `ui5-tooling-modules`

My initial prompt:

```text
I want to extend the `ui5-tooling-modules` project with the capability to created so-called cascaded builds. This means in case of usage in OpenUI5, I need to integrate "@ui5/webcomponents" in multiple libraries, e.g. in "sap.m" and "sap.f". When now in "sap.m" the "@ui5/webcomponents/dist/Button" is used, it pulls framework dependencies and when using the e.g. other Web Components in "sap.f" the build for "sap.f" should not include the dependencies which are already included in the dependent "sap.m" library and reused. I started to handle this with externals and maybe we need to store some available externals information per NPM package so that in libraries dependening on them can reuse this information for its build. This is at least my idea how to create such a cascading build solution.
```

## Context

In OpenUI5, `@ui5/webcomponents` must be integrated into multiple libraries (e.g. `sap.m`, `sap.f`). Without coordination, each library re-bundles the same shared framework dependencies (`@ui5/webcomponents-base`, etc.), causing duplicate code and potential runtime conflicts.

The goal: when `sap.m` already bundled `@ui5/webcomponents-base/dist/UI5Element`, building `sap.f` should treat that module as an **external** (a Rollup external) and reference `sap.m`'s bundled output path instead of re-bundling it.

The current in-progress implementation uses externals support in `createBundle()`. This plan refines that approach to fix several issues.

## Issues in Current Implementation

1. **Writing into `node_modules`**: Manifests are written to `<npm-pkg>/.ui5-tooling-modules/externals.json`. Fragile with package managers, breaks with pnpm CAS, lost on `npm ci`.

2. **Entire NPM package marked as external**: `filterForExternalModules()` marks ALL modules from an NPM package as external if the package name appears in a library dep's dependencies. If `sap.m` only bundled 5 of 50 modules from `@ui5/webcomponents-base`, `sap.f` would still mark all 50 as external -> runtime 404s.

3. **Fire-and-forget async write**: The `mkdir().then(() => writeFile()).catch()` at util.js:1660 is not `await`ed. Next library build may start before manifest is fully written.

4. **Crash when `dependencyRoots` is `false`**: When `legacyDependencyResolution` is truthy, `!legacyDependencyResolution && findDependencies(...)` evaluates to `false`. Then `dependencyRoots.filter(...)` throws `TypeError`.

5. **Framework projects excluded**: `task.js:69` filters out framework projects from `depPaths`. In OpenUI5 builds, dependent libraries ARE framework projects - their manifests wouldn't be discovered.

## Design Decisions

### Manifest Location: Library Root Directory

Write manifest to `<library-root>/.ui5-tooling-modules/externals-manifest.json` instead of into `node_modules/`.

Rationale:
- Library root is stable and writable
- Follows existing `.ui5-tooling-modules/` convention (used by `BundleInfoCache`)
- No `node_modules` mutation
- Consuming library can discover it via `taskUtil.getDependencies()` + `getProject(dep).getRootPath()`

### Manifest Format

```json
{
  "libraryName": "sap.m",
  "libraryNamespace": "sap/m",
  "modules": {
    "@ui5/webcomponents-base/dist/UI5Element": "sap/m/gen/ui5/webcomponents-base/dist/UI5Element",
    "@ui5/webcomponents/dist/Button": "sap/m/gen/ui5/webcomponents/dist/Button"
  }
}
```

Only **actually bundled** modules are listed. Module-level granularity, not package-level.

### Externals Detection: Module-Level

Only mark individual modules as external if they appear in a dependency library's manifest. No package-level assumptions.

### Configuration

Opt-in via `ui5.yaml`:

```yaml
configuration:
  cascadedBuild: true  # enables reading dependency manifests + writing own manifest
```

### Library Dependency Discovery

Use `taskUtil.getDependencies()` directly (including framework projects) for manifest discovery. This is separate from `dependencyRoots` (which controls NPM module allowlisting).

## Implementation Steps

### Step 1: Add `cascadedBuild` config + library dep discovery in `task.js`

**File:** `packages/ui5-tooling-modules/lib/task.js`

- Parse `config.cascadedBuild` (boolean, default `false`)
- Compute library dependency roots from ALL `taskUtil.getDependencies()` (including framework projects):
  ```js
  const libraryDeps = config.cascadedBuild
    ? taskUtil.getDependencies()
        .map(dep => taskUtil.getProject(dep))
        .map(prj => ({ name: prj.getName(), namespace: prj.getNamespace(), rootPath: prj.getRootPath() }))
    : [];
  ```
- Pass `libraryDeps` and `writeExternalsManifest: config.cascadedBuild` to `getBundleInfo()` options

### Step 2: Refactor `getBundleInfo` in `util.js`

**File:** `packages/ui5-tooling-modules/lib/util.js` (getBundleInfo ~line 1320)

- Add `libraryDeps` and `writeExternalsManifest` to the options parameter
- **Load manifests** before `createBundle()`:
  ```js
  const loadedExternals = {};
  for (const libDep of libraryDeps) {
    const manifestPath = path.join(libDep.rootPath, ".ui5-tooling-modules", "externals-manifest.json");
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, { encoding: "utf-8" }));
      Object.assign(loadedExternals, manifest.modules || {});
    }
  }
  ```
- Pass `loadedExternals` to `createBundle()` options
- **Write manifest** after bundling (replace current fire-and-forget approach):
  ```js
  if (writeExternalsManifest && typeof rewriteDep === "function") {
    const manifestModules = {};
    for (const entry of bundleInfo.getBundledResources()) {
      manifestModules[entry.name] = rewriteDep(entry.name, bundleInfo);
    }
    const manifest = {
      libraryName: projectInfo.name,
      libraryNamespace: projectInfo.namespace,
      modules: manifestModules,
    };
    const manifestDir = path.join(projectInfo.rootPath, ".ui5-tooling-modules");
    await mkdir(manifestDir, { recursive: true });
    await writeFile(path.join(manifestDir, "externals-manifest.json"), JSON.stringify(manifest, null, 2));
  }
  ```

### Step 3: Simplify `createBundle` externals logic in `util.js`

**File:** `packages/ui5-tooling-modules/lib/util.js` (createBundle ~line 1108)

- Add `loadedExternals = {}` to the parameter destructuring
- **Remove** the current library-root-scanning logic (lines 1113-1146 in current diff) that reads from `node_modules`
- Guard `dependencyRoots` against falsy: `dependencyRoots = dependencyRoots || [];`
- Simplify `filterForExternalModules`:
  ```js
  const externals = {};
  const filterForExternalModules = (moduleName) => {
    if (loadedExternals[moduleName]) {
      externals[moduleName] = loadedExternals[moduleName];
      return true;
    }
    return false;
  };
  ```
- Keep the existing Rollup `external: filterForExternalModules` and module filtering
- Keep passing `filterForExternalModules` to the webcomponents plugin

### Step 4: Default `filterForExternalModules` in webcomponents plugin

**File:** `packages/ui5-tooling-modules/lib/rollup-plugin-webcomponents.js`

- Default parameter: `filterForExternalModules = () => false`
- Prevents crashes when called without cascaded build context (e.g. middleware)

### Step 5: Bug fixes

- **util.js**: Guard `dependencyRoots = dependencyRoots || []` at top of `createBundle()`
- **task.js**: Keep the existing null check fix for `getResource` result

## Build Flow Example

```
Build sap.m:
  1. taskUtil.getDependencies() => [sap.ui.core]
  2. Check sap.ui.core for externals-manifest.json => not found
  3. Bundle @ui5/webcomponents/dist/Button + all framework deps
  4. Write <sap.m>/.ui5-tooling-modules/externals-manifest.json

Build sap.f (depends on sap.m):
  1. taskUtil.getDependencies() => [sap.m, sap.ui.core]
  2. Check sap.m for externals-manifest.json => found!
     Load: { "@ui5/webcomponents-base/dist/UI5Element": "sap/m/gen/ui5/...", ... }
  3. Bundle @ui5/webcomponents-fiori/dist/SideNavigation
     - @ui5/webcomponents-base/dist/UI5Element => external, maps to sap/m/gen/...
     - New modules not in manifest => bundled normally
  4. Write <sap.f>/.ui5-tooling-modules/externals-manifest.json (only sap.f's own modules)
```

## Verification

1. Build a test library that bundles some `@ui5/webcomponents` modules with `cascadedBuild: true`
2. Verify `externals-manifest.json` is written to the library root with correct module mappings
3. Build a second test library that depends on the first, also with `cascadedBuild: true`
4. Verify the second library's Rollup output does NOT include modules from the first library's manifest
5. Verify the second library's generated code references the first library's rewritten paths
6. Run existing tests: `cd packages/ui5-tooling-modules && npm test`

## Files to Modify

| File | Changes |
|------|---------|
| `lib/task.js` | Add `cascadedBuild` config, compute `libraryDeps`, pass to `getBundleInfo` |
| `lib/util.js` | Refactor `createBundle` externals (accept `loadedExternals`), refactor `getBundleInfo` (load/write manifests to library root, `await` writes), fix `dependencyRoots` guard |
| `lib/rollup-plugin-webcomponents.js` | Default `filterForExternalModules` param |
