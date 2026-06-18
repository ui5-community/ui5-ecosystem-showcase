# ui5-ecosystem-showcase

[![📖 Documentation](https://img.shields.io/badge/docs-ui5--community.github.io-blue)](https://ui5-community.github.io/ui5-ecosystem-showcase/)
[![🔎 Find an extension](https://img.shields.io/badge/find-bestofui5.org-orange)](https://bestofui5.org/)
[![OpenUI5 Slack (#tooling)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/)
[![License](https://img.shields.io/github/license/ui5-community/ui5-ecosystem-showcase)](LICENSE)

> 📖 **The full, browsable docs live at [ui5-community.github.io/ui5-ecosystem-showcase](https://ui5-community.github.io/ui5-ecosystem-showcase/)** — extension catalog, picker, contribution guide, and more.

This monorepo ships **27 community-maintained UI5 CLI extensions** — tasks, middlewares, and full UI5 CLI extensions — plus a set of showcase apps that demonstrate them in practice. It's the reference for what the [UI5 CLI](https://ui5.github.io/cli/) extensibility (custom [tasks](https://ui5.github.io/cli/pages/extensibility/CustomTasks/) and [middlewares](https://ui5.github.io/cli/pages/extensibility/CustomServerMiddleware/)) is capable of.

> :wave: This is a **community project** — no official SAP support. Use it, file issues, contribute, help others.

## Quick links

- 🚀 [**Get started**](#getting-started) (clone & run locally)
- 📦 [**Browse the 27 extensions**](https://ui5-community.github.io/ui5-ecosystem-showcase/extensions/)
- 🧭 [**Pick the right tool for your problem**](https://ui5-community.github.io/ui5-ecosystem-showcase/selecting/)
- 🔌 [**Backend connectivity comparison**](https://ui5-community.github.io/ui5-ecosystem-showcase/backend-connectivity/)
- 🤝 [**Contribute**](#contributing)
- 🔎 [**Find more on Best of UI5**](https://bestofui5.org/) — registry of community UI5 packages

## Highlights

- **27 published packages** — middlewares, tasks, and tooling for daily UI5 development.
- **Several with millions of monthly NPM downloads** — `ui5-tooling-transpile`, `ui5-tooling-modules`, `ui5-task-zipper`, `ui5-middleware-livereload`, `ui5-middleware-simpleproxy`.
- **Automated releases** via [Changesets](https://github.com/changesets/changesets) + GitHub Actions, OIDC trusted publishing to NPM.
- **Spec V3** — built for [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) and [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30).

## Repository layout

The content is split between `packages/` (the published UI5 CLI extensions) and `showcases/` (demo apps that exercise them):

```text
packages
├── cds-plugin-ui5                  // embed UI5 CLI projects via express middleware into a CDS server
├── dev-approuter                   // dev-time wrapper for SAP Application Router serving UI5 / CAP modules
├── karma-ui5-transpile             // Karma preprocessor: transpile sources via ui5-tooling-transpile
├── ui5-middleware-approuter        // proxy SAP CF / XSA destinations during dev
├── ui5-middleware-cap              // embed CAP CDS server middlewares in the UI5 dev server
├── ui5-middleware-iasync           // sync UI interactions across browsers (alpha!)
├── ui5-middleware-index            // serve a generated welcome / start page at /
├── ui5-middleware-livereload       // live-reload webapp sources on change
├── ui5-middleware-onelogin         // generic login support
├── ui5-middleware-serveframework   // serve resources of a locally built framework
├── ui5-middleware-servestatic      // serve static resources
├── ui5-middleware-simpleproxy      // simple express proxy
├── ui5-middleware-ui5              // UI5 apps as dependencies of another UI5 app
├── ui5-middleware-webjars          // deliver content from JAR files
├── ui5-middleware-websocket        // WebSocket support for the UI5 dev server
├── ui5-task-cachebuster            // cache-busting for standalone applications
├── ui5-task-copyright              // copyright headers for TS / JS / XML
├── ui5-task-flatten-library        // flatten output for SAP NetWeaver deployment
├── ui5-task-i18ncheck              // detect missing i18n texts
├── ui5-task-minify-xml             // minify XML resources
├── ui5-task-pwa-enabler            // turn the app into a PWA
├── ui5-task-zipper                 // zip the entire webapp
├── ui5-tooling-less                // build / serve LESS files
├── ui5-tooling-modules             // direct consumption of NPM packages in UI5
├── ui5-tooling-stringreplace       // replace placeholder strings
├── ui5-tooling-transpile           // transpile (TS / modern JS) via Babel
└── ui5-utils-express               // helper utilities for express
```

```text
showcases
├── approuter                       // showcase for the dev-approuter
├── cds-bookshop                    // CDS bookshop demonstrating cds-plugin-ui5
├── cds-bookshop-ui5-viewer         // UI5 viewer referenced in cds-bookshop
├── ui5-app                         // UI5 application
├── ui5-app-simple                  // simple UI5 application using UI5 CLI V3
├── ui5-bookshop-viewer             // standalone UI5 viewer demoing ui5-middleware-cap
├── ui5-lib                         // UI5 library
├── ui5-module                      // UI5 module providing a custom control as NPM package
├── ui5-tsapp                       // TypeScript UI5 application
├── ui5-tsapp-simple                // simple TS UI5 application using UI5 CLI V3
├── ui5-tsapp-webc                  // TS UI5 application using UI5 Web Components
├── ui5-tslib                       // TypeScript UI5 library
└── ui5-tsmodule                    // TS UI5 module providing a custom control as NPM package
```

## Getting started

You'll need a [Long-Term Support version](https://nodejs.org/en/about/releases/) of Node.js (>= 22) and [pnpm](https://pnpm.io/) (>= 11.5.0):

```bash
# Install pnpm if you don't have it
npm i -g pnpm

# Clone & install
git clone https://github.com/ui5-community/ui5-ecosystem-showcase.git
cd ui5-ecosystem-showcase
pnpm install
```

Then pick what you want to run:

```bash
# 1) Dev mode — live reload, on-the-fly transpile, proxy, NPM packages as deps
pnpm dev

# 1.1) TypeScript app dev mode
pnpm dev:ts

# 2) Component-preload build + watch
pnpm watch

# 3) Run the dist folder (build first via `pnpm build` or `pnpm build:ts`)
pnpm start
pnpm start:ts

# 4) QUnit + OPA5 tests against /webapp/* of /packages/ui5-app (Chrome)
pnpm test:opa5

# 5) End-to-end tests via wdi5 (run `pnpm dev` in another terminal first)
pnpm test:wdi5

# 6) End-to-end tests in CI mode (Chrome headless, server lifecycle managed)
pnpm test:ci
```

## Using these extensions in your own project

Each package is published independently to NPM. Install the ones you need and follow the consumption snippet in each package's local `README.md`.

For the **full, filterable catalog** with descriptions and direct links, see [the extensions page](https://ui5-community.github.io/ui5-ecosystem-showcase/extensions/) on the docs site, or browse the wider UI5 community on [**bestofui5.org**](https://bestofui5.org/) — the recommended starting point for *finding* a UI5 extension. Most packages from this repo are indexed there; a handful aren't (yet) — see the [extensions page](https://ui5-community.github.io/ui5-ecosystem-showcase/extensions/#packages-not-yet-on-best-of-ui5) for the list.

## Backend connectivity

Six tools in this repo can connect a UI5 app to a backend (`cds-plugin-ui5`, `ui5-middleware-cap`, `ui5-middleware-approuter`, `@sap/approuter`, `dev-approuter`, `ui5-middleware-simpleproxy`). The full feature comparison — productive vs dev use, UAA, BTP destinations, WebSockets, embedded CAP, mock UAA — lives at [Backend connectivity](https://ui5-community.github.io/ui5-ecosystem-showcase/backend-connectivity/) on the docs site.

## Contributing

Two paths, both welcome:

- **Inside this monorepo** — get free CI and automated NPM publishing in exchange for a community review and ongoing maintenance.
- **In your own repo** — full control, bring your own release process, then [submit your package to Best of UI5](https://github.com/ui5-community/bestofui5-data/issues/new?assignees=marianfoo&labels=new%20package&template=new_package.md&title=Add%20new%20Package:) so other developers can find it.

Detail on both paths: [Contributing on the docs site](https://ui5-community.github.io/ui5-ecosystem-showcase/contributing/). Development workflow (pnpm, branches, conventional commits, Changesets, releases): [`CONTRIBUTING.md`](CONTRIBUTING.md). Conduct: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Security: [`SECURITY.md`](SECURITY.md).

Bugs and feature requests live on [GitHub issues](https://github.com/ui5-community/ui5-ecosystem-showcase/issues).

## License

This work is licensed under [Apache 2.0](LICENSE).

---

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
