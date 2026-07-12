# ui5-tooling-modules

**Package Version:** 3.37.7
**Last Updated:** 2026-07-12

---

## Overview

The **ui5-tooling-modules** package is a UI5 CLI extension that enables UI5 applications to consume NPM packages as AMD-like modules. It automatically converts CommonJS/ES6 modules from `node_modules` into UI5-compatible AMD format using Rollup at both development and build time.

### Core Value Proposition
- **Zero Configuration NPM Integration**: Use any NPM package directly in UI5 apps with `sap.ui.define(["npm-package"], ...)`
- **Automatic Transformation**: Converts ES6/CommonJS to UI5 AMD format transparently
- **Web Components Support**: Special handling for Web Components with UI5 control wrapper generation
- **Performance Optimized**: Caching, bundling, and code splitting for production builds

---

## Architecture Overview

### High-Level Flow

```
UI5 App Code → Scan Dependencies → Bundle with Rollup → Transform to AMD → Serve/Build
     ↓              ↓                      ↓                    ↓              ↓
  (imports)    (util.js)         (rollup plugins)       (sap.ui.define)  (output)
```

### Key Components

#### 1. **Custom Middleware** ([middleware.js](lib/middleware.js))
- **Purpose**: Development server that transforms NPM packages on-the-fly
- **Lifecycle**:
  1. Intercepts HTTP requests matching NPM package patterns
  2. Scans project for dependencies
  3. Bundles modules using Rollup
  4. Serves transformed AMD modules
  5. Watches files for changes and rebundles
- **Key Features**:
  - File watching with Chokidar
  - In-memory and persistent caching
  - Dynamic module loading
  - "Stellvertreter" (proxy) module generation for proper namespacing

#### 2. **Custom Task** ([task.js](lib/task.js))
- **Purpose**: Build-time bundling and namespace integration
- **Lifecycle**:
  1. Scans all project sources for NPM dependencies
  2. Creates bundles for each unique dependency
  3. Rewrites module paths in source files
  4. Optionally moves modules into project namespace
  5. Generates path mappings for Component.js
- **Key Operations**:
  - JS dependency rewriting (sap.ui.define/require)
  - XML dependency rewriting (namespace attributes)
  - Namespace management (thirdparty vs gen folders)
  - JSDoc path rewriting

#### 3. **Utility Module** ([util.js](lib/util.js))
- **Core Functions**:
  - `scan()`: Discovers dependencies from source files
  - `resolveModule()`: Node.js resolution algorithm implementation
  - `createBundle()`: Rollup bundling orchestration
  - `getBundleInfo()`: Caching and bundle management
  - `getResource()`: Resource retrieval from node_modules
- **Key Algorithms**:
  - **Package.json Export Resolution**: Implements Node.js package entry points (exports, browser, main fields)
  - **Dependency Graph Analysis**: Transitive dependency resolution
  - **Wildcard Mapping**: Handles package.json wildcard exports
  - **Module Caching**: SHA-256 layered fingerprint cache keys covering tool sources, configuration, lockfile, and the transitive module graph (see [Caching Architecture](#4-caching-architecture))

#### 4. **Rollup Plugin Ecosystem**

Core plugins in the transformation pipeline:

| Plugin | Purpose | File |
|--------|---------|------|
| **webcomponents** | Web Components → UI5 Controls | [rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js) |
| **resolve-module** | Workspace-aware module resolution. Package-manager-agnostic: works with npm, yarn, and pnpm (isolated or hoisted) without any pnpm-specific code path. | rollup-plugin-resolve-module.js |
| **dynamic-imports** | Dynamic import handling | rollup-plugin-dynamic-imports.js |
| **polyfill-node-override** | Node.js API polyfills | rollup-plugin-polyfill-node-override.js |
| **skip-assets** | Skip CSS/asset imports | rollup-plugin-skip-assets.js |
| **inject-esmodule** | ESModule marker injection | rollup-plugin-inject-esmodule.js |
| **import-meta** | import.meta transformation | rollup-plugin-import-meta.js |

---

## Recent Changes & Current State

### Bundle Cache Invalidation Rework

The cache key construction in [util.js](lib/util.js) was reworked end-to-end. The previous key only mixed `mtime(util.js)` + the max `mtime` of the entry modules, which silently reused stale bundles in several common scenarios. See [CACHE-INVALIDATION.md](CACHE-INVALIDATION.md) for the full design and gap analysis.

**What changed:**

1. **Layered SHA-256 cache key** (replaces the old `md5(myLastModified:lastModified:entry-paths)` key). The new key combines four independent fingerprints, joined with `:` and SHA-256-hashed:
   - `getToolFingerprint()` — package version + every `.js`/`.mjs`/`.cjs`/`.hbs` file under `lib/`. Memoized once per process.
   - `getConfigFingerprint(opts)` — stable JSON of all bundle-affecting options (`pluginOptions`, `generatedCode`, `minify`, `inject`, `sourcemap`, `keepDynamicImports`, `skipTransform`, `dynamicEntriesPath`).
   - `getLockfileFingerprint(cwd)` — `package.json` + nearest lockfile (`pnpm-lock.yaml` / `package-lock.json` / `yarn.lock` / `npm-shrinkwrap.json`), discovered by walking up from `cwd`. Memoized per `(lockfile, package.json)` mtime.
   - `getInputGraphFingerprint(paths)` — sorted `path\0size\0mtime` triples for the entry modules.
2. **Two-phase validation for the persistent cache.** When `persistentCache: true`, the recorded transitive module graph (`relatedPaths` on the persisted `BundleInfo`) is re-stat'd on load. A mismatch returns `undefined` from `BundleInfoCache.get()`, forcing a rebuild. This is the case `git checkout` can fool (mtime is rewritten to checkout time, not commit time), so a stale persisted entry can no longer slip past the cheap entry-mtime check.
3. **`BundleInfo` carries `_inputFingerprint`.** Captured at `BundleInfoCache.store()` time and serialized through `toJSON()` / `fromJSON()`.
4. **`md5` → `sha256` everywhere.** Both the bundle cache key and `resolveModule`'s `modulesCache` key. No measurable perf impact at these input sizes; silences security scanners flagging `md5`.

**Gaps this closes (vs. the previous key):**

- Editing `rollup-plugin-webcomponents.js`, `rollup-plugin-modules.js`, `WebComponentRegistry.js`, `DTSSerializer.js`, `JSDocSerializer.js`, or any `templates/**/*.hbs` now busts the cache.
- Bumping `ui5-tooling-modules` itself in `node_modules` (e.g. fresh `pnpm install`) busts the cache.
- Toggling `minify` / `sourcemap` / `generatedCode` / `inject` / `keepDynamicImports` / `skipTransform` / `dynamicEntriesPath` / `pluginOptions` busts the cache.
- A change deep in a transitive dependency busts the cache (verified on persistent-cache load).
- A `pnpm-lock.yaml` / `package-lock.json` bump busts the cache.
- Fresh `git checkout` / CI runs no longer reuse stale persisted entries.

### Recent Commit History

| Commit | Description | Impact |
|--------|-------------|--------|
| `5d419442` | Sync `defaultValue` handling between rollup plugin and Handlebars helper | Web Component defaults emitted as proper JSON (booleans/numbers/objects), `undefined` dropped |
| `9c4a3259` | Correct JSDoc generation for enums and `defaultValue` handling | Fixes downstream JSDoc build/validation for enum-typed properties |
| `848bc704` | Centralize custom-element detection in `WebComponentRegistryHelper.isCustomElement()` | Single source of truth for "is this a real custom element?" (incl. inherited flags) |
| `55f9a537` | Restore replacement chunk for direct webc module imports | Fixes direct import of a single Web Component module (native/non-UI5) losing its UI5 wrapper |
| `b4153fa1` | Skip complex-type lookup when `typeInfoRef` has no module | Silences misleading warnings for ambient/library-internal manifest types |
| `81eb56c5` | Align `@implements` JSDoc with `interfaces` declaration | Generated wrapper JSDoc and metadata now agree on interface module names |
| `f96206fe` | Hold `ignore-walk` at `^8.0.0` | Keeps Node.js 20 support (see [DEPENDENCIES.md](DEPENDENCIES.md)) |
| `485131bc` | Allow deeper nested web component classes of the same name (#1318); add `isUI5WebComponents` flag | Wrappers now generated for non-UI5 WC packages; improved class resolution |
| `b8578cd9` | Rework bundle cache invalidation (#1365) | Layered SHA-256 cache key (see below) |

---

## Critical Implementation Details

### 1. Module Resolution Strategy

The tool implements a custom Node.js-style module resolution with several special cases:

```javascript
// Resolution Priority (from util.js:resolveModule)
1. App-local modules (pkgName/path in same package)
2. Package.json exports field (with wildcards and conditions)
3. Package.json browser field
4. Package.json main/module/esnext fields
5. Manual node_modules traversal (for ERR_PACKAGE_PATH_NOT_EXPORTED)
6. Fallback to require.resolve
```

**Key Edge Cases**:

- Symlinked dependencies (always resolved to realpath, so `pnpm`'s isolated layout, `npm`/`yarn` workspace symlinks, and yarn berry's `node-modules` linker all flatten to the same on-disk targets)
- Scoped packages (@org/package)
- Case-sensitive file systems
- Modules with .js in their name (e.g., easytimer.js)

### 2. Namespace Management

Two namespace strategies controlled by `addToNamespace`:

**Strategy A: Integrated (addToNamespace: true)**
```
/resources/
  └── my/app/namespace/
      ├── thirdparty/          ← Regular NPM packages
      │   └── chart.js/
      └── gen/                 ← Web Components
          └── @ui5/webcomponents/
```

**Strategy B: Separate (addToNamespace: false)**
```
/resources/
  ├── chart.js/               ← Direct in resources
  └── my/app/namespace/
```

**Rationale**: Strategy A enables Fiori Launchpad deployment by making all dependencies component-local.

### 3. Web Components Transformation

The webcomponents plugin performs sophisticated transformations:

1. **Custom Elements Manifest Parsing**: Reads metadata from package.json `customElements` field (falling back to `dist/custom-elements.json` / `dist/custom-elements-internal.json`)
2. **UI5 Control Wrapper Generation**: Creates UI5 controls that wrap Web Components
3. **Scoping Support**: Handles UI5 Web Components scoping (multiple versions)
4. **Asset Management**: Handles themes, i18n bundles, and dynamic imports
5. **TypeScript Definitions**: Generates .d.ts files for TypeScript projects

**Key Data Flow**:
```
NPM Package → CEM Parsing → WebComponentRegistry → UI5 Wrapper Generation → AMD Bundle
```

**Three handled cases** (detected automatically, see [rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js)):

The registry entry carries an `isUI5WebComponents` flag, set when the package *is* `@ui5/webcomponents-base` or lists it in its `dependencies` (see `loadNpmPackage`). Combined with `WebComponentRegistryHelper.isCustomElement()` and the component's superclass chain, this drives which of the following applies:

1. **UI5 Web Components** (`isUI5WebComponents: true`, e.g. `@ui5/webcomponents`): full pipeline — an emitted package chunk, base-package (`@ui5/webcomponents-base`) import prepended before the component, scoping applied, and a UI5 control wrapper per custom element.

2. **Non-UI5 Web Components with a package** (`isUI5WebComponents: false`, e.g. `@luigi-project/container`): UI5 control wrappers are still generated for every custom element, but the UI5-specific chunk emission, base-package import, and scoping are **skipped**. The package itself has no `_ui5metadata`; its wrapper classes are exposed as exports (`LuigiContainer`, `LuigiCompoundContainer`, ...).

3. **Native Web Components** (`load` hook, marked `NATIVE_WEBC_SUPPORT`): a custom element whose class does **not** extend `UI5Element` (`clazz.superclass` is falsy) loads **only the component module itself** — neither the package nor `@ui5/webcomponents-base` is prepended, since it needs no scoping or package features. It simply registers itself via `customElements.define(...)` on evaluation. For direct imports of a single component module (entries typed `"module"` in `resolveId`/`load`), a `sap.ui.define` re-export **replacement chunk** is emitted in `generateBundle` so the import resolves through the generated UI5 wrapper (restored in `55f9a537` after `#1310` accidentally dropped it).

### 4. Caching Architecture

Two-tier caching system with a layered SHA-256 fingerprint as the cache key. See [CACHE-INVALIDATION.md](CACHE-INVALIDATION.md) for the full design rationale.

**In-Memory Cache** (`BundleInfoCache`, [util.js](lib/util.js)):

- Stores complete `BundleInfo` objects keyed by the layered fingerprint
- Cleared on process restart

**Persistent Cache** (when `persistentCache: true`):

- Location: `<cwd>/.ui5-tooling-modules/<key>.bundleinfo.json`
- Survives server restarts
- Should be gitignored
- On load, the recorded transitive module graph is re-stat'd against disk; mismatches force a rebuild

#### Cache Key Construction

The bundle cache key is the SHA-256 of four colon-joined fingerprints:

```
sha256(toolFp : configFp : lockfileFp : entryGraphFp : "name@path,...")
```

| Layer | Inputs | Cost |
| ----- | ------ | ---- |
| `getToolFingerprint()` | `name@version` + every `.js`/`.mjs`/`.cjs`/`.hbs` under `lib/` (content-hashed) | Paid once per process (memoized) |
| `getConfigFingerprint(opts)` | Stable JSON of `pluginOptions`, `generatedCode`, `minify`, `inject`, `sourcemap`, `keepDynamicImports`, `skipTransform`, `dynamicEntriesPath` | Negligible (single hash of a small JSON string) |
| `getLockfileFingerprint(cwd)` | `package.json` + nearest lockfile (pnpm/npm/yarn) | Memoized per `(lockfile, package.json)` mtime |
| `getInputGraphFingerprint(paths)` | Sorted `path\0size\0mtime` triples for entry modules | One `stat()` per entry module |

#### Two-Phase Validation

The cache check happens *before* `createBundle()`, but the full transitive module graph is only known *after* (Rollup discovers it during bundling). The fast/slow split:

- **Fast pre-check** (every cache lookup): hash entry-module path/size/mtime + the layers above. Cheap.
- **Confirmation step** (persistent-cache load only): re-stat the recorded `relatedPaths` on the persisted `BundleInfo` and compare against the stored `_inputFingerprint`. Catches the `git checkout` / CI case where mtime is rewritten to checkout time and the entry-mtime check would otherwise pass.

After each successful build, `BundleInfoCache.store()` captures `getInputGraphFingerprint(bundleInfo.getRelatedPaths())` onto the `BundleInfo` so the next persistent load can verify it.

#### What invalidates the cache (automatically)

- `ui5-tooling-modules` version bump (covered by tool fingerprint)
- Any edit under `lib/**/*.{js,mjs,cjs,hbs}` (covered by tool fingerprint)
- Any change to `pluginOptions` / `minify` / `sourcemap` / `inject` / `generatedCode` / `keepDynamicImports` / `skipTransform` / `dynamicEntriesPath` (covered by config fingerprint)
- `package.json` or lockfile change in any ancestor of `cwd` (covered by lockfile fingerprint)
- Add/remove/edit of any entry module (covered by entry-graph fingerprint)
- Edit of any transitive dependency, when loading the persistent cache (covered by the confirmation step on `relatedPaths`)

### 5. Dependency Rewriting

Three types of path rewriting occur:

**A. Import Rewriting** (in generated bundles):
```javascript
// Before: ./chunk-abc123
// After:  my/app/namespace/thirdparty/chunk-abc123
```

**B. Module Name Rewriting** (in source files):
```javascript
// Before: sap.ui.define(["chart.js"], ...)
// After:  sap.ui.define(["my/app/namespace/thirdparty/chart.js"], ...)
```

**C. XML Namespace Rewriting** (in XML views):
```xml
<!-- Before: xmlns:webc="@ui5/webcomponents" -->
<!-- After:  xmlns:webc="my.app.namespace.gen.@ui5.webcomponents" -->
```

---

## Configuration Deep Dive

### Essential Options

| Option | Type | Default | Impact |
|--------|------|---------|--------|
| `debug` | boolean/string | false | Enables verbose logging ("verbose" for max detail) |
| `skipCache` | boolean | false | Forces rebuild (dev use only) |
| `persistentCache` | boolean | false | Survives restarts (experimental) |
| `addToNamespace` | boolean/string | true | Moves modules into component namespace |
| `legacyDependencyResolution` | boolean | false | Includes devDependencies (pre-3.7 behavior) |
| `providedDependencies` | string[] | [] | Excludes deps from bundling (runtime provided) |
| `skipTransform` | boolean/string[] | false | Skips transformation for specific modules |
| `keepDynamicImports` | boolean/string[] | true | Preserves dynamic imports (for ES modules) |

### Web Components Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `pluginOptions.webcomponents.skip` | boolean | false | Disables WC transformation |
| `pluginOptions.webcomponents.scoping` | boolean | true | Enables UI5 WC scoping |
| `pluginOptions.webcomponents.namespace` | boolean/string | "gen" | WC namespace folder |
| `pluginOptions.webcomponents.skipJSDoc` | boolean | true | Skips JSDoc generation |
| `pluginOptions.webcomponents.includeAssets` | boolean | false | Includes all themes/i18n |

---

## Common Scenarios & Solutions

### Scenario 1: Module Not Found During Build
**Symptoms**: Module works in dev, fails in build
**Cause**: Module in devDependencies, not dependencies
**Solution**: Move to dependencies or add to `additionalDependencies`

### Scenario 2: Dynamic Import Fails
**Symptoms**: `require() with non-static arguments` error
**Cause**: Generic dynamic imports can't be bundled
**Solution**: Add to `keepDynamicImports` array

### Scenario 3: Module Transformation Issues
**Symptoms**: Module breaks after bundling
**Cause**: Module already uses sap.ui.define or SystemJS
**Solution**: Add to `skipTransform` array

### Scenario 4: Slow Build Times
**Symptoms**: Build takes minutes
**Cause**: Large dependency trees, no caching
**Solutions**:
- Enable `persistentCache: true`
- Exclude unused modules via `providedDependencies`
- Use `skipTransform` for pre-bundled UMD modules

### Scenario 5: Fiori Launchpad Deployment
**Symptoms**: Modules not found in FLP
**Cause**: Absolute paths don't work in FLP
**Solution**: Ensure `addToNamespace: true` (default)

### Scenario 6: Web Components Don't Load
**Symptoms**: Web Components fail to initialize
**Check**:
- Custom Elements Manifest in package.json?
- Framework version in ui5.yaml? (required for WC detection)
- Check `pluginOptions.webcomponents.force: true` if no ui5.yaml

---

## Development & Maintenance

### Testing Strategy

**Test Files**: `test/**/*.test.js`
**Runner**: AVA
**Commands**:
```bash
npm test                    # Run all tests
npm run test:snapshots      # Regenerate snapshots
```

**Test Coverage Areas**:
- Module resolution edge cases
- Package.json exports parsing
- XML/JS dependency scanning
- Bundle generation
- Cache invalidation

### Debugging Tips

1. **Enable Verbose Logging**:
   ```yaml
   configuration:
     debug: "verbose"
   ```

2. **Disable Caching**:
   ```yaml
   configuration:
     skipCache: true
   ```

3. **Inspect Bundle Contents**:
   - Check `.ui5-tooling-modules/` folder (if persistent cache enabled)
   - Add breakpoints in [util.js:getBundleInfo](lib/util.js#L1310)

4. **Module Resolution Issues**:
   - Add logging in [util.js:resolveModule](lib/util.js#L839)
   - Check `modulesCache` and `modulesNegativeCache`

5. **Rollup Plugin Issues**:
   - Use [rollup-plugin-logger.js](lib/rollup-plugin-logger.js)
   - Check Rollup warnings in console

### Performance Profiling

Key metrics tracked internally (see util.js):
```javascript
perfmetrics: {
  resolveModulesTime: 0,     // Total time resolving modules
  resolveModules: {}          // Per-module resolution times
}
```

Bottlenecks to monitor:
- `scan()` - Large projects with many files
- `createBundle()` - Complex dependency trees
- `rewriteJSDeps()` - TypeScript parsing overhead
- File watching - Too many watched files

### Breaking Changes to Watch For

**Dependencies**:
- Rollup version updates (currently 4.x)
- TypeScript ESTree parser updates
- Fast-XML-Parser changes
- UI5 CLI breaking changes

**Node.js Compatibility**:
- Package exports field changes
- Module resolution algorithm updates
- Native ES modules in Node.js

---

## Known Issues & Limitations

### Current Limitations

1. **UI5 Control Modules from NPM**:
   - Module names (dot syntax) not rewritten in metadata
   - Can cause issues with `Object.isA()` checks
   - Renderer lookups may fail if not inlined
   - See [task.js:191](lib/task.js#L191) warning

2. **Dynamic Imports**:
   - Generic `import(anyUrl)` cannot be bundled
   - Only concrete paths can be converted to chunks
   - Use `keepDynamicImports` to preserve ES modules

3. **Source Maps**:
   - Disabled by default (performance)
   - May break during path rewriting
   - Experimental feature

4. **Web Components JSDoc**:
   - Currently disabled (skipJSDoc: true)
   - Needs sanitized namespaces for proper generation
   - TypeScript .d.ts generation also experimental

### Future Enhancement Areas

1. **Performance**:
   - Parallel bundling of independent modules
   - Incremental builds (only changed modules)
   - Better caching granularity

2. **Web Components**:
   - Complete JSDoc generation
   - Full TypeScript support
   - Better asset management

3. **Developer Experience**:
   - Better error messages for common issues
   - Configuration validation
   - Auto-migration from devDependencies

---

## Critical Files Reference

### Core Logic
- [lib/util.js](lib/util.js) - 1732 lines - Module resolution, bundling, caching
- [lib/task.js](lib/task.js) - 570 lines - Build-time processing
- [lib/middleware.js](lib/middleware.js) - 396 lines - Dev server

### Rollup Plugins
- [lib/rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js) - Web Components transformation
- [lib/rollup-plugin-dynamic-imports.js](lib/rollup-plugin-dynamic-imports.js) - Dynamic import handling
- [lib/rollup-plugin-resolve-module.js](lib/rollup-plugin-resolve-module.js) - Custom module resolution

### Utilities
- [lib/utils/WebComponentRegistry.js](lib/utils/WebComponentRegistry.js) - WC metadata management
- [lib/utils/parseJS.js](lib/utils/parseJS.js) - JS object parsing from strings

---

## Deployment Checklist

### Before Release

- [ ] Run full test suite: `npm test`
- [ ] Test with real UI5 application (`ui5-app`)
- [ ] Test Web Components scenario (`ui5-tsapp-webc`)
- [ ] Test build and dev server modes
- [ ] Check for TypeScript errors (if applicable)
- [ ] Verify examples in README work

### Breaking Change Protocol

1. Update major version (following semver)
2. Document in README under "Breaking Changes"
3. Provide migration guide
4. Test with community showcase apps
5. Announce in UI5 community channels

---

## Support & Community

**Repository**: https://github.com/ui5-community/ui5-ecosystem-showcase
**Issues**: https://github.com/ui5-community/ui5-ecosystem-showcase/issues
**Package**: https://www.npmjs.com/package/ui5-tooling-modules
**License**: Apache 2.0 / Beer-ware (dual license)

**Key Maintainers**:
- Original Author: Peter Muessig
- Community contributions welcome

---

## Quick Reference Commands

```bash
# Installation
npm install ui5-tooling-modules --save-dev

# Auto-register in ui5.yaml
npm install ui5-tooling-modules --save-dev -rte

# Development
npm run lint              # ESLint
npm test                  # Run tests
npm run test:snapshots    # Update test snapshots

# Debugging
UI5_LOG_LVL=verbose ui5 serve    # Verbose logging
```

---

## Appendix: Architecture Diagrams

### Request Flow (Middleware)
```
Browser Request (chart.js.js)
    ↓
Middleware intercepts /resources/chart.js.js
    ↓
Checks NPM package cache (exists?)
    ↓
If needed: Scan project → Create bundle
    ↓
Return transformed AMD module
```

### Build Flow (Task)
```
UI5 Build starts
    ↓
Task: ui5-tooling-modules-task (after replaceVersion)
    ↓
Scan all sources (JS/TS/XML)
    ↓
Resolve unique NPM dependencies
    ↓
Bundle each dependency with Rollup
    ↓
Rewrite paths in source files
    ↓
Write bundled resources to dist/
    ↓
Continue with next UI5 build task
```
