# ui5-tooling-modules

**Package Version:** 3.34.5
**Last Updated:** 2026-02-11

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
  - **Module Caching**: MD5-based cache keys with lastModified tracking

#### 4. **Rollup Plugin Ecosystem**

Core plugins in the transformation pipeline:

| Plugin | Purpose | File |
|--------|---------|------|
| **webcomponents** | Web Components → UI5 Controls | [rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js) |
| **pnpm-resolve** | PNPM workspace resolution | rollup-plugin-pnpm-resolve.js |
| **dynamic-imports** | Dynamic import handling | rollup-plugin-dynamic-imports.js |
| **polyfill-node-override** | Node.js API polyfills | rollup-plugin-polyfill-node-override.js |
| **skip-assets** | Skip CSS/asset imports | rollup-plugin-skip-assets.js |
| **inject-esmodule** | ESModule marker injection | rollup-plugin-inject-esmodule.js |
| **import-meta** | import.meta transformation | rollup-plugin-import-meta.js |

---

## Recent Changes & Current State

### Modified Files (From Git Status)
The following files have uncommitted changes:

1. **[rollup-plugin-webcomponents.js](lib/rollup-plugin-webcomponents.js)** (Modified)
   - Added `filterForExternalModules` parameter to plugin options
   - Added external module filtering in two places:
     - Before emitting chunks (line 172)
     - In resolveId hook (line 428)
   - **Purpose**: Prevent bundling of external dependencies that are provided by other UI5 libraries

2. **[task.js](lib/task.js)** (Modified)
   - Changes not yet committed (likely related to namespace handling or path rewriting)

3. **[util.js](lib/util.js)** (Modified)
   - Changes not yet committed (likely dependency resolution improvements)

### Recent Commit History

| Commit | Description | Impact |
|--------|-------------|--------|
| `8a5cd402` | Robust parsing and handling of webc metadata (#1316) | Improved Web Components metadata handling |
| `d7ab7a8e` | Properly lookup package.json for workspaces (#1314) | Fixed workspace/monorepo support |
| `1ca62f1e` | Import base package for all entry modules (#1310) | Fixed Web Components base package imports |

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
- Symlinked dependencies (always resolved to realpath)
- pnpm workspaces (special package.json lookup)
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

1. **Custom Elements Manifest Parsing**: Reads metadata from package.json `customElements` field
2. **UI5 Control Wrapper Generation**: Creates UI5 controls that wrap Web Components
3. **Scoping Support**: Handles UI5 Web Components scoping (multiple versions)
4. **Asset Management**: Handles themes, i18n bundles, and dynamic imports
5. **TypeScript Definitions**: Generates .d.ts files for TypeScript projects

**Key Data Flow**:
```
NPM Package → CEM Parsing → WebComponentRegistry → UI5 Wrapper Generation → AMD Bundle
```

### 4. Caching Architecture

Two-tier caching system:

**In-Memory Cache** (BundleInfoCache):
- Cache key: MD5(lastModified + moduleNames + paths)
- Stores complete BundleInfo objects
- Cleared on process restart

**Persistent Cache** (when enabled):
- Location: `.ui5-tooling-modules/*.bundleinfo.json`
- Survives server restarts
- Should be gitignored

**Cache Invalidation**:
- Triggered by file changes (via Chokidar watcher)
- MD5 hash includes file modification times
- Util.js modification time included in cache key

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
- [lib/rollup-plugin-pnpm-resolve.js](lib/rollup-plugin-pnpm-resolve.js) - PNPM resolution

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
