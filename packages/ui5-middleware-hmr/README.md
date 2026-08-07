# UI5 middleware for hot module replacement (HMR) of `webapp` sources on change — EXPERIMENTAL

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a hot module replacement when files inside `$yourapp` change, e.g. on save — reloading only what changed instead of the whole page.

> :warning: **Experimental prototype.** This middleware attempts true hot module replacement for UI5 apps instead of a full-page live reload. It relies on a **private, deprecated** UI5 loader API and internal control/registry behavior. It is intended for local development only and may break across UI5 versions. When the mechanism is unavailable it degrades to a full page reload.

What gets hot-swapped vs. reloaded:

| Change | Behavior |
| --- | --- |
| `*.css` | stylesheet re-injected, no reload |
| `*.js` / `*.ts` leaf module (formatter, model, helper) | module unloaded + re-required |
| `*.js` / `*.ts` leaf with dependents | changed module **and its transitive dependents** unloaded + re-required (server computes the dependency graph) |
| `*.controller.js` | owning `XMLView`(s) re-instantiated in place; models preserved |
| `*.properties` (i18n) | `ResourceModel` recreated with a cache-busted bundle + swapped onto the component; bound texts refresh, no reload |
| `*.json` | matching `JSONModel` reloaded via `loadData` (cache-busted) |
| `*.view.xml` (non-routed) | owning `XMLView`(s) re-instantiated in place (template re-read fresh); models preserved |
| `*.view.xml` (routed target) | router re-matches the current route and rebuilds the view through its own lifecycle; models preserved |
| `*.view.xml` (root view / `sap.ui5/rootView`) | owning **Component** rebuilt in place (see `Component.js`) |
| `*.fragment.xml` (embedded in a view) | embedding view(s) re-instantiated (server resolves fragment → views); models preserved |
| `Component.js` / `Component.ts` | **Component rebuilt in place** through its `ComponentContainer`; current route preserved; runtime model state lost |
| `*.fragment.xml` (loaded imperatively, e.g. dialogs) | full reload *(no embedding view to re-instantiate)* |
| `*.xml` (other) | full reload |
| anything else | full reload |

See [Scenarios: what improves over live reload](#scenarios-what-improves-over-live-reload) for the full matrix with the reasoning behind each case.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-middleware-hmr --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false
  verbose logging (server + browser console)
- port: `integer`, default: an free port choosen from `35739` onwards
  port the hot module replacement (WebSocket) server is started on
- watchPath|path: `string`, default: all paths from app and non framework dependencies
  path inside `$yourapp` the server monitors for changes
- exclusions: one or many `regex`. By default, this includes `.git/`, `.svn/`, and `.hg/`
- usePolling: true|false, default: `false`
  Enables chokidar polling to support virtualised filesystems(eg. WSL2.0).
- force: true|false, default: *unset*
  force-enable (`true`) or force-disable (`false`) the middleware, overriding the automatic UI5 Tooling V5+ auto-disable (see [UI5 Tooling V5](#ui5-tooling-v5) below)

## UI5 Tooling V5

UI5 Tooling **V5** provides a **built-in Live Reload**. Per the official docs, combining a custom live-reload middleware with the built-in feature can make the page "refresh more often than necessary." To avoid that, this middleware **automatically disables itself when running under UI5 Tooling V5 or higher** (detected via the `@ui5/server` major version).

- To keep using this middleware under V5, set `configuration.force: true` **and** disable the built-in Live Reload via the `--no-live-reload` CLI flag or the `server.settings.liveReload` configuration option (otherwise both run and the page double-reloads).
- To disable this middleware on **any** tooling version, set `configuration.force: false`.

See the [UI5 CLI v5 migration guide](https://ui5.github.io/cli/v5/updates/migrate-v5) for details on the built-in Live Reload and other V5 changes.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-hmr": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml` (use *instead of* `ui5-middleware-livereload`):

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
```

Using the configuration properties (if needed):

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      watchPath: "webapp"
```

or with `path` instead of `watchPath`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      path: "webapp"
```

Watch multiple paths:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      path:
            - "webapp"
            - "../my.reuse.library/src/my/reuse/library"
```

Use polling to watch files:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      usePolling: true
```

Exclude single subpath from `path`s/ `watchPath`s:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      watchPath: "webapp"
      exclusions:
            - "wdi5/"
```

Exclude multiple subpaths from  `path`s/ `watchPath`s:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-hmr
    afterMiddleware: compression
    configuration:
      debug: true
      port: 35739
      watchPath: "webapp"
      exclusions:
          - "wdi5/"
          - "integration/"
```

## How it works

1. The server watches source paths with [chokidar](https://github.com/paulmillr/chokidar) and classifies each change into a typed event carrying the **UI5 module name**.
2. Events are pushed to the browser over a WebSocket.
3. A small client runtime (injected before `</body>`) dispatches per type. Module hot-swap uses the private loader API:

   ```js
   sap.ui.loader._.unloadResources(name + ".js", /*bPreloadGroup*/ false, /*bUnloadAll*/ true, /*bDeleteExports*/ true);
   ```

   which removes the module from the loader registry so the next `sap.ui.require` re-fetches and re-executes fresh code.

When a change cannot be hot-swapped, the middleware falls back to a full reload — so, like a live reload, all connected browsers reload the application, `#`-aware (the current displayed route in your single-page UI5 app is kept steady).

### Why not "real" webpack/Vite-style HMR?

UI5 has no HMR-aware module runtime and no framework hook to rebind a fresh controller onto a live view. `unloadResources` gives us module-graph *invalidation*, which makes leaf-module swap and view re-instantiation possible, but it does **not** give us state-preserving controller swap. So controllers are handled by re-instantiating the owning view (models survive; that view's transient UI state does not).

## Scenarios: what improves over live reload

`ui5-middleware-livereload` does one thing on any change: **reload the whole page**. That is
robust, but it throws away all application state — the current route, open dialogs, form input,
model data fetched from a backend, scroll position — and pays a full framework boot on every save.

HMR's goal is to apply the smallest change that makes your edit visible while **keeping as much
live state as possible**. The table below is every scenario that was designed and verified, what
HMR does, and — crucially — *why* it works or why it still falls back to a reload.

Legend: 🟢 hot-swap (no reload) · 🟡 partial (in-place rebuild, some transient state lost) ·
🔴 full reload (same as live reload).

### Styling & assets

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| `*.css` change | 🟢 stylesheet re-injected | 🔴 reload | The changed `<link>`'s `href` is re-pointed with a cache-busting query param. The browser re-parses just that stylesheet; the DOM, route and all app state are untouched. |

### Plain modules (formatter / model / helper / util)

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| Leaf `*.js`/`*.ts` module with no dependents | 🟢 unloaded + re-required | 🔴 reload | `sap.ui.loader._.unloadResources` drops the module from the loader registry; the next `sap.ui.require` re-fetches fresh code. Nothing else references stale code. |
| Leaf module **with dependents** (other app modules `sap.ui.define`-import it) | 🟢 module + transitive dependents unloaded + re-required | 🔴 reload | A module that already captured the *old* reference in its closure would keep using it. The **server** parses `sap.ui.define([...])` arrays across the app to compute the reverse-dependency set and tells the client to unload them too, so every holder re-requires fresh code. |
| Module whose dependency is only referenced via a **computed name** or in-body `sap.ui.require([...])` | 🟡 changed module swaps, that dependent may not refresh | 🔴 reload | The static graph only sees literal `sap.ui.define([...])` arrays (the loader's forward deps are closure-private, so no client-side graph is possible). Dynamically-named deps are invisible to it. Edit the dependent directly to force its refresh. |

### Controllers

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| `*.controller.js`/`.ts` own-code change | 🟡 owning view(s) re-instantiated in place | 🔴 reload | UI5 has **no** API to rebind a fresh controller onto a live view. So the client re-requires the controller to a fresh class **first**, then re-creates the owning `XMLView` with the same id in the same aggregation slot. Component/parent **models survive**; the view's transient UI state (scroll, selection, unsaved input) is lost. |
| Controller change where a routed view owns it | 🟡 router re-matches + rebuilds the view | 🔴 reload | Same as above, but routed views are rebuilt through the router (see routed views below) so navigation state stays consistent. |

### Views (`*.view.xml`)

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| Non-routed view embedded in a control aggregation | 🟡 re-instantiated in place | 🔴 reload | `XMLView.create` re-reads the template from the server (no XML cache to bust) and is inserted into the same aggregation slot with the original id. Typed aggregation mutators (e.g. `insertPage`) are preferred so container bookkeeping (CSS classes, height) is applied. |
| **Routed** view that is currently displayed | 🟡 router re-match rebuilds it in place | 🔴 reload | The router owns routed views' whole lifecycle (view cache, `NavContainer` current-page, nav history). The client evicts the router's view cache, destroys the old instance, and calls `router.parse(currentHash)` so the **router** rebuilds and re-navigates — with the transition forced to instant `show`, so the edited view reappears with no root flash / slide. |
| **Routed** view in a subfolder (e.g. `view/fiori/DynamicPage.view.xml`, target `viewName: "fiori.DynamicPage"`) | 🟢 fixed — router re-match | 🔴 reload | *This used to misbehave* (see below). The target's `viewName` is relative to `viewPath` and contains a dot (`fiori.DynamicPage`); the fix matches it against **both** the qualified and the `viewPath`-relative form, so subfolder targets are recognized and refreshed through the router instead of falling back. |
| **Routed** view that is **not** the current page | 🟡 evicted, rebuilt on next navigation | 🔴 reload | Re-parsing the hash would spuriously re-navigate to the *current* route. Instead the client just evicts the router cache entry; the next real `navTo` rebuilds it cleanly via a cache miss. |
| Root view (the manifest `sap.ui5/rootView`, e.g. `App.view.xml`) | 🟡 owning Component rebuilt in place | 🔴 reload | The root view's parent is the `UIComponent` itself (no aggregation slot to swap into), so it's refreshed by rebuilding the Component (see below). Route is preserved. |

### Components

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| `Component.js`/`.ts` change | 🟡 Component rebuilt in place, route preserved | 🔴 reload | *This used to be a full reload.* The client finds the live component's `ComponentContainer`, clears the association, destroys the old instance, and lets the declarative container recreate it via its own lifecycle. `Component.create({manifest:true})` re-reads a fresh `manifest.json`, and the new `init()` re-initialises the router, which re-parses the current hash — so **you stay on the same route**. Runtime model/app state (backend reads, user input) is lost; that's the cost of rebuilding the app root, still cheaper than a full framework boot. |
| Component change reached only as a **dependent** of another changed module | 🟡 Component rebuilt | 🔴 reload | Previously a Component appearing in the dependents set was silently dropped. It now rebuilds like a direct change. |
| `manifest.json` change (rootView, routing, models, dependencies) | 🟡 picked up on the next Component rebuild | 🔴 reload | The manifest is re-fetched (`no-store`) whenever the Component is recreated, so editing the Component (or root view) applies manifest changes too. A standalone manifest-only edit is not yet a dedicated trigger. |

### i18n & data

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| `*.properties` (i18n) change | 🟢 `ResourceModel` recreated + re-bound | 🔴 reload | `ResourceBundle` caches parsed properties **by URL**, so the model is recreated with a cache-busted `bundleUrl` (a new query key forces a re-parse) and swapped onto the component, which re-resolves i18n bindings. The server sends `no-store` for `.properties` so the fetch hits disk. Bound texts update with no reload. |
| `*.json` model change | 🟢 `JSONModel.loadData` (cache-busted) | 🔴 reload | The matching model (declared in the manifest with a `uri`/`dataSource`) is re-loaded via `loadData`; bindings update automatically. |

### Fragments (`*.fragment.xml`)

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| Fragment embedded declaratively (`<core:Fragment fragmentName="…"/>`) | 🟡 embedding view(s) re-instantiated | 🔴 reload | A fragment has no live instance of its own, but the server keeps a fragment→view graph (parsed from `fragmentName=` references, resolved transitively for fragments-in-fragments) and tells the client which view(s) to rebuild; `XMLView.create` re-reads the fragment fresh. |
| Fragment loaded imperatively (`Fragment.load(...)`, typically dialogs) | 🔴 full reload | 🔴 reload | There is no embedding view to re-instantiate and no live handle to the fragment's content, so there's nothing to swap in place. Honest reload. |
| Fragment referenced by a **computed** `fragmentName` | 🔴 full reload | 🔴 reload | Only static `fragmentName` attributes are parsed into the graph; a computed name can't be resolved to a view, so it reloads. |

### Bootstrap & everything else

| Scenario | HMR | Live reload | Why |
| --- | --- | --- | --- |
| Other `*.xml` / unknown file types | 🔴 full reload | 🔴 reload | No safe in-place strategy; degrade to reload. |
| Private loader API (`unloadResources`) unavailable (removed in a future UI5) | 🔴 full reload | 🔴 reload | Feature-detected at connect time; if missing, **all** module/view/component changes fall back to reload, so HMR degrades to live-reload behavior rather than breaking. |
| Nested app / running behind a path-prefixing proxy | 🟢 client script still loads | n/a | The injected client `<script src>` is **relative to the served HTML** (not server-root-absolute), so it resolves back to this server's root at any nesting depth. |

### Notes on two bugs that were found & fixed here

Both were in the routed-view path and produced the classic "I edited a nested view and it jumped
back to the first page" symptom:

1. **Subfolder routed targets never matched.** The target-name matcher assumed a dotted `viewName`
   was already fully-qualified — but a *relative* name in a subfolder (`fiori.DynamicPage`) also
   contains a dot. Such targets silently dropped to the generic aggregation swap. Fixed by matching
   against both the qualified and the `viewPath`-relative interpretation.
2. **Routed views could misroute into a Component rebuild.** A routed target view can transiently
   report an empty `getParent()`; the "is this a root view?" check misread that as the Component's
   root view and rebuilt the whole Component → full reload landing on the default (first) page. Fixed
   by attempting the router-based swap **first**, so a routed target is always handled by the router.

## Known limitations

- **Private + deprecated API.** `sap.ui.loader._.unloadResources` is private and
  deprecated as of UI5 **1.135** ("without replacement"). Feature-detected; falls back
  to full reload when missing.
- **Reverse-dependency tracking is static + server-side.** The dependency graph is built
  by parsing `sap.ui.define([...])` arrays across the app's own modules (the loader's
  forward deps are closure-private, so a client-side graph isn't possible). Computed
  dependency arrays or `sap.ui.require([...])` inside function bodies are not tracked.
- **Controller hot-swap re-instantiates the owning view.** On a controller change (or a
  change to a leaf it depends on), the client re-requires the controller module to a fresh,
  executed class **before** calling `XMLView.create`, then swaps the new view into the same
  aggregation slot with the original id preserved. Doing the re-require explicitly (rather
  than letting `create` trigger it) avoids a race where the view would instantiate a stale
  controller class. Verified for controller-own-code changes, leaf-dependency propagation,
  and repeated consecutive edits. The view's transient UI state (scroll, selection) is lost;
  models on the component/parent survive.
- **XML view (`*.view.xml`) hot-swap** re-instantiates the matching live `XMLView`(s):
  `XMLView.create` re-reads the template from the server (no XML cache to bust), so the new
  markup renders in place with the original view id preserved. For **routed** views, the
  router owns the view lifecycle: the client evicts the router's view cache, destroys the old
  instance, and re-matches the current route (`router.parse(hash)`) so the router rebuilds
  and re-navigates cleanly — using an instant transition so the edited view reappears in
  place (no root flash / slide). Same trade-off as controller swap — transient view UI state
  is lost, component/parent models survive.
- **Component (`Component.js`) and root-view hot-swap rebuild the Component in place.** The
  client resolves the live component's `ComponentContainer`, clears the association, destroys
  the old instance, and lets the (declarative) container recreate it through its own lifecycle.
  `Component.create({manifest:true})` re-reads a fresh `manifest.json`, and the new `init()`
  re-initialises the router, which re-parses the current hash — so the **active route is
  preserved**. The container's stored `settings.id` is normalized before recreation because
  `ComponentContainer._createComponent` mutates it in place (prefixing with the container id),
  which is not idempotent and would otherwise double-prefix the id on repeated swaps. Because
  the whole control tree is rebuilt, **runtime model/app state is lost** (heavier than a view
  swap, still lighter than a framework boot). The manifest `rootView` is refreshed the same way
  (its parent is the `UIComponent`, so there is no aggregation slot to swap into). Any failure
  in this path degrades to a full reload.
- **Fragments (`*.fragment.xml`): embedded ones hot-swap, imperative ones reload.** A
  fragment has no live instance of its own, but a fragment embedded declaratively in a view
  (`<core:Fragment fragmentName="…"/>`) is re-read fresh when that view is re-instantiated.
  The server keeps a fragment→view graph (parsed from `fragmentName=` references across
  `*.view.xml`/`*.fragment.xml`, resolved transitively for fragments-in-fragments) and, on a
  fragment change, tells the client which view(s) to re-instantiate. Fragments loaded
  imperatively in a controller (`Fragment.load(...)`, typically dialogs) have no embedding
  view, so they fall back to a full reload. Only static `fragmentName` attributes are
  tracked (computed names are not).
- **Timing.** The server waits for writes to settle (`awaitWriteFinish`) and sends
  `Cache-Control: no-store` for app `.js`/`.properties`/`.json`/`.xml` (not framework
  `/resources/`), and the client pre-fetches a module's canonical URL `no-store` before
  re-requiring — together these prevent a hot-swap from loading stale bytes.
- **i18n (`.properties`) hot-refresh** recreates each `ResourceModel` from its manifest
  config with a **cache-busted `bundleUrl`** and swaps it onto the owning component, which
  re-resolves the i18n bindings. Two details make it work: `ResourceBundle` caches parsed
  properties by URL (so a *new* query param is required to force a re-parse), and the
  middleware sends `Cache-Control: no-store` for `.properties`/`.json` (so the fetch hits
  disk, not the browser cache). Reusing the same URL — via `bundleName` or
  `_handleLocalizationChange` — returns the stale bundle.
- **JSON** hot-reload uses `JSONModel.loadData(uri)` with a cache-busting query param. The
  `loadData` mechanism is verified; end-to-end matching relies on the model being declared
  in the manifest with a `uri` (or a referenced `dataSource`).
- **WebSocket** runs on its own port (default from `35739`), separate from the UI5 server.

## Misc/FAQ

yep, cross-browser, cross-platform.

## License

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
