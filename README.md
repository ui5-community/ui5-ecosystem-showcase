# ui5-ecosystem-showcase

[![OpenUI5 Community Slack (#tooling channel)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/)

The repository is showcasing the ecosystem possibilites of the UI5 Tooling.

> :wave: This is a **community project** and there is no official support! Feel free to use it, open issues, contribute, and help answering questions.

## Prerequisites

- Latest releases of the provided tooling extensions require at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All tooling extensions using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Overview

This repository showcases the endless possibilities of the UI5 Tooling. The UI5 Tooling extensibility (tasks and middleware) can be used to combine various OSS tools for UI5 application development. This increases the development experience and efficiency and also allows to use well-known tools.

The content of the repository is structured in `packages` and `showcases`. The `packages` folder includes the tooling extensions implementations and the `showcases` includes the demo applications, libraries and modules.

### Packages (Tooling Extensions)

The following list provides an overview of the available tooling extensions in this repository:

```text
packages
├── cds-plugin-ui5                  // cds-plugin: embed UI5 tooling based projects via express middleware into CDS server
├── dev-approuter                   // dev time wrapper for the SAP Application Router that can serve UI5 and CDS modules added as dependencies
├── karma-ui5-transpile             // karma preprocessor: transpile sources using ui5-tooling-transpile
├── ui5-middleware-cap              // middleware extension: use the CDS server middlewares inside the UI5 tooling
├── ui5-middleware-approuter        // middleware extension: use the approuter as proxy for SAP Cloud Foundry or SAP XS Advanced backend services
├── ui5-middleware-iasync           // middleware extension: sync UI interaction across browsers (alpha! careful!)
├── ui5-middleware-index            // middleware extension: serve an HTML file for / (root)
├── ui5-middleware-livereload       // middleware extension: usage of livereload for development
├── ui5-middleware-onelogin         // middleware extension: enable a generic login support
├── ui5-middleware-serveframework   // middleware extension: serve resources of a locally built framework
├── ui5-middleware-servestatic      // middleware extension: serve static resources
├── ui5-middleware-simpleproxy      // middleware extension: simple express proxy
├── ui5-middleware-ui5              // middleware extension: enable UI5 application dependencies for UI5 dev server
├── ui5-middleware-webjars          // middleware extension: deliver content from JAR files
├── ui5-middleware-websocket        // middleware extension: enable web sockets for the UI5 Tooling
├── ui5-task-cachebuster            // task extension: enables cachebusting for standalone applications
├── ui5-task-flatten-library        // task extension: prepares build result for deployment to SAP NetWeaver
├── ui5-task-i18ncheck              // task extension: checks for missing i18n texts
├── ui5-task-minify-xml             // task extension: minify xml resources
├── ui5-task-pwa-enabler            // task extension: enables ui5 app with pwa functionalities
├── ui5-task-zipper                 // task extension: bundle the entire webapp in a zip-archive
├── ui5-tooling-less                // tooling extension: serving and building less files
├── ui5-tooling-modules             // tooling extension: direct consumption of NPM packages in UI5 apps
├── ui5-tooling-stringreplace       // tooling extension: replaces placeholder strings
├── ui5-tooling-transpile           // tooling extension: transpile resources using Babel
└── ui5-utils-express               // utilities: helper stuff for express
```

### Showcases (Demos)

The following list provides an overview of the available showcases in this repository:

```text
showcases
├── approuter                       // Showcase for the dev-approuter
├── cds-bookshop                    // CDS bookshop app to showcase cds-plugin-ui5
├── cds-bookshop-ui5-viewer         // UI5 bookshop viewer referenced in cds-bookshop
├── ui5-app                         // UI5 application
├── ui5-app-simple                  // simple UI5 application using UI5 Tooling V3
├── ui5-bookshop-viewer             // Standalone UI5 bookshop viewer to demo ui5-middleware-cap
├── ui5-lib                         // UI5 library
├── ui5-module                      // UI5 module providing a custom control as NPM package
├── ui5-tsapp                       // TypeScript UI5 application
├── ui5-tsapp-simple                // simple TypeScript UI5 application using UI5 Tooling V3
└── ui5-tslib                       // TypeScript UI5 library
```

## Getting Started

First of all, make sure to use a proper [long-term support version](https://nodejs.org/en/about/releases/) of Node.js. You can download it from [nodejs.org](https://nodejs.org/en/download/) or use [`nvm`](https://github.com/nvm-sh/nvm).

The `ui5-ecosystem-showcase` repository is a monorepo based using [`pnpm`](https://pnpm.io/). To get started with `pnpm`, it's best to install it globally:

```bash
# Install pnpm (if not done already)
npm i -g pnpm
```

To get started with the project, please ensure to run `pnpm install` once to setup your mono repo and download and install all required dependencies.

```bash
# Install the node modules via pnpm
pnpm install
```

To get started just run one of the following commands:

```bash
# 1) Run the dev mode
# which gives you 
# - live reload of ui5-app/webapp/**/**
# - live transpilation of ui5-app/webapp/**/** on the fly
#   including debug functionality via source maps
#   (attention: async functions not yet supported!)
# - proxy functionality at $server/proxy
# - POC: same proxy middleware reused at $server/proxy2
# - cf-style proxy destinations at $server/$destinations
# - ability to execute the same UI actions across all browsers pointed to http://localhost:1081/index.html
# - using NPM packages as dependencies
pnpm dev

# 1.1) Run the TypeScript app dev mode
# which gives you 
# - live transpilation of TypeScript code
# - using NPM packages as dependencies
pnpm dev:ts

# 2) Run the Component-preload build + transpile steps
# which in addition to the above
# - transpiles all ui5-app/webapp/**/* to ui5-app/dist
# - live reload of ui5-app/dist/**/*
pnpm watch

# 3) Run the dist folder (needs manual build via `pnpm build` first)
pnpm start

# 3.1) Run the dist folder for the TypeScript app (needs manual build via `pnpm build:ts` first)
pnpm start:ts

# 4) Run Unit-(QUnit-)Tests and Integration-(OPA5-)Tests
# against "as-is" sources in /webapp/* (of /packages/ui5-app)
# with Chrome
# note: no transpiling, no bundling/building
pnpm test:opa5

# 5) Run end-to-end tests
# in dedicated terminal: 
pnpm dev # > start the local ui5 server tooling
# in another terminal:
# (uses Chrome)
pnpm test:wdi5 # > run e2e tests via wdi5 from /packages/ui5-app/webapp/test/e2e/*

# 6) Utilize CI for end-to-end tests
# using Chrome headless
pnpm test:ci # > start ui5 server in background, runs wdi5-tests, shuts down the ui5 server
```

## Using tasks and middlewares in your project

The tasks developed in this monorepo are also publicly available on NPM right here:

* https://www.npmjs.com/package/ui5-task-cachebuster
* https://www.npmjs.com/package/ui5-task-flatten-library
* https://www.npmjs.com/package/ui5-task-i18ncheck 
* https://www.npmjs.com/package/ui5-task-minify-xml
* https://www.npmjs.com/package/ui5-task-pwa-enabler
* https://www.npmjs.com/package/ui5-task-zipper

The middlewares developed in this monorepo are also publicly available on NPM right here:

* https://www.npmjs.com/package/ui5-middleware-cap
* https://www.npmjs.com/package/ui5-middleware-approuter
* https://www.npmjs.com/package/ui5-middleware-iasync (alpha! careful!)
* https://www.npmjs.com/package/ui5-middleware-index
* https://www.npmjs.com/package/ui5-middleware-livereload
* https://www.npmjs.com/package/ui5-middleware-onelogin
* https://www.npmjs.com/package/ui5-middleware-serveframework
* https://www.npmjs.com/package/ui5-middleware-servestatic
* https://www.npmjs.com/package/ui5-middleware-simpleproxy
* https://www.npmjs.com/package/ui5-middleware-ui5
* https://www.npmjs.com/package/ui5-middleware-webjars
* https://www.npmjs.com/package/ui5-middleware-websocket

The tooling extensions (contains tasks and middlewares) developed in this monorepo are available on NPM right here:

* https://www.npmjs.com/package/ui5-tooling-less
* https://www.npmjs.com/package/ui5-tooling-modules
* https://www.npmjs.com/package/ui5-tooling-stringreplace
* https://www.npmjs.com/package/ui5-tooling-transpile

The consumption of the individual tasks and middlewares can be seen inside their local `README.md`.

Available tasks in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-task-cachebuster](https://www.npmjs.com/package/ui5-task-cachebuster) | enables cachebusting for standalone applications | [![npm version](https://badge.fury.io/js/ui5-task-cachebuster.svg)](https://badge.fury.io/js/ui5-task-cachebuster) |
| [ui5-task-flatten-library](https://www.npmjs.com/package/ui5-task-flatten-library) | prepares build result for deployment to SAP NetWeaver | [![npm version](https://badge.fury.io/js/ui5-task-flatten-library.svg)](https://badge.fury.io/js/ui5-task-flatten-library) |
| [ui5-task-i18ncheck](packages/ui5-task-i18ncheck/README.md) | checks for missing i18n texts | [![npm version](https://badge.fury.io/js/ui5-task-i18ncheck.svg)](https://badge.fury.io/js/ui5-task-i18ncheck) |
| [ui5-task-minify-xml](packages/ui5-task-minify-xml/README.md) | minify xml resources | [![npm version](https://badge.fury.io/js/ui5-task-minify-xml.svg)](https://badge.fury.io/js/ui5-task-minify-xml) |
| [ui5-task-pwa-enabler](packages/ui5-task-pwa-enabler/README.md) | enables ui5 app with pwa functionalities | [![npm version](https://badge.fury.io/js/ui5-task-pwa-enabler.svg)](https://badge.fury.io/js/ui5-task-pwa-enabler) |
| [ui5-task-zipper](packages/ui5-task-zipper/README.md) | bundle the entire webapp in a zip-archive | [![npm version](https://badge.fury.io/js/ui5-task-zipper.svg)](https://badge.fury.io/js/ui5-task-zipper) |

Available middlewares in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-middleware-cap](packages/ui5-middleware-cap/README.md) | use the CDS server middlewares inside the UI5 tooling | [![npm version](https://badge.fury.io/js/ui5-middleware-cap.svg)](https://badge.fury.io/js/ui5-middleware-cap) |
| [ui5-middleware-approuter](packages/ui5-middleware-approuter/README.md) | use the approuter as proxy for SAP Cloud Foundry or SAP XS Advanced backend services | [![npm version](https://badge.fury.io/js/ui5-middleware-approuter.svg)](https://badge.fury.io/js/ui5-middleware-approuter) |
| [ui5-middleware-iasync](packages/ui5-middleware-iasync/README.md) | sync UI interactions across connected browsers (alpha! careful!) | [![npm version](https://badge.fury.io/js/ui5-middleware-iasync.svg)](https://badge.fury.io/js/ui5-middleware-iasync) |
| [ui5-middleware-index](packages/ui5-middleware-index/README.md) | serve an HTML file for / (root) | [![npm version](https://badge.fury.io/js/ui5-middleware-index.svg)](https://badge.fury.io/js/ui5-middleware-index) |
| [ui5-middleware-livereload](packages/ui5-middleware-livereload/README.md) | usage of livereload for development | [![npm version](https://badge.fury.io/js/ui5-middleware-livereload.svg)](https://badge.fury.io/js/ui5-middleware-livereload) |
| [ui5-middleware-serveframework](packages/ui5-middleware-serveframework/README.md) | serve resources of a locally built framework | [![npm version](https://badge.fury.io/js/ui5-middleware-serveframework.svg)](https://badge.fury.io/js/ui5-middleware-servestatic) |
| [ui5-middleware-servestatic](packages/ui5-middleware-servestatic/README.md) | serve static resources | [![npm version](https://badge.fury.io/js/ui5-middleware-servestatic.svg)](https://badge.fury.io/js/ui5-middleware-servestatic) |
| [ui5-middleware-onelogin](packages/ui5-middleware-onelogin/README.md) | enable a generic login support | [![npm version](https://badge.fury.io/js/ui5-middleware-onelogin.svg)](https://badge.fury.io/js/ui5-middleware-onelogin) |
| [ui5-middleware-simpleproxy](packages/ui5-middleware-simpleproxy/README.md) | simple express proxy | [![npm version](https://badge.fury.io/js/ui5-middleware-simpleproxy.svg)](https://badge.fury.io/js/ui5-middleware-simpleproxy) |
| [ui5-middleware-ui5](packages/ui5-middleware-ui5/README.md) | enable UI5 application dependencies | [![npm version](https://badge.fury.io/js/ui5-middleware-ui5.svg)](https://badge.fury.io/js/ui5-middleware-ui5) |
| [ui5-middleware-webjars](packages/ui5-middleware-webjars/README.md) | deliver content from JAR files | [![npm version](https://badge.fury.io/js/ui5-middleware-webjars.svg)](https://badge.fury.io/js/ui5-middleware-webjars) |
| [ui5-middleware-websocket](packages/ui5-middleware-websocket/README.md) | enable web sockets for UI5 tooling | [![npm version](https://badge.fury.io/js/ui5-middleware-websocket.svg)](https://badge.fury.io/js/ui5-middleware-websocket) |

Available tooling extensions in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-tooling-less](packages/ui5-tooling-less/README.md) | build less files | [![npm version](https://badge.fury.io/js/ui5-tooling-less.svg)](https://badge.fury.io/js/ui5-tooling-less) |
| [ui5-tooling-modules](packages/ui5-tooling-modules/README.md) | direct consumption of NPM packages | [![npm version](https://badge.fury.io/js/ui5-tooling-modules.svg)](https://badge.fury.io/js/ui5-tooling-modules) |
| [ui5-tooling-stringreplace](packages/ui5-tooling-stringreplace/README.md) | replace placeholder strings | [![npm version](https://badge.fury.io/js/ui5-tooling-stringreplace.svg)](https://badge.fury.io/js/ui5-tooling-stringreplace) |
| [ui5-tooling-transpile](packages/ui5-tooling-transpile/README.md) | transpile resources using Babel | [![npm version](https://badge.fury.io/js/ui5-tooling-transpile.svg)](https://badge.fury.io/js/ui5-tooling-transpile) |

Other NPM packages in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [cds-plugin-ui5](packages/cds-plugin-ui5/README.md) | embed UI5 tooling based projects via express middleware into CDS server | [![npm version](https://badge.fury.io/js/cds-plugin-ui5.svg)](https://badge.fury.io/js/cds-plugin-ui5) |
| [dev-approuter](packages/dev-approuter/README.md) | dev time wrapper for the SAP Application Router that can serve UI5 and CDS modules added as dependencies | [![npm version](https://badge.fury.io/js/dev-approuter.svg)](https://badge.fury.io/js/dev-approuter) |
| [karma-ui5-transpile](packages/karma-ui5-transpile/README.md) | Karma preprocessor to transpile sources using `ui5-tooling-transpile` | [![npm version](https://badge.fury.io/js/karma-ui5-transpile.svg)](https://badge.fury.io/js/karma-ui5-transpile) |
| [ui5-utils-express](packages/ui5-utils-express/README.md) | utilities for express | [![npm version](https://badge.fury.io/js/ui5-utils-express.svg)](https://badge.fury.io/js/ui5-utils-express) |

## Backend Connectivity

The UI5 Ecosystem Showcase provides several tooling extensions which can be used to connect to different backends.

### `cds-plugin-ui5`

[cds-plugin-ui5](packages/cds-plugin-ui5/README.md)

The `cds-plugin-ui5` is a CDS server `cds-plugin` which enables the integration of UI5 tooling based (UI5 freestyle or Fiori elements) projects into the CDS server via the UI5 tooling express middlewares. The UI5 or Fiori elements projects just need to be located in the `app` folder of the CDS server or be dependency of the CDS server.

### `ui5-middleware-cap`

[ui5-middleware-cap](packages/ui5-middleware-cap/README.md)

The `ui5-middleware-cap` is a UI5 tooling middleware which is used to improve the development experience for the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/about/) and enables the integration of a CDS server into the UI5 development server via the CDS server express middlewares. In addition to the middleware the CDS server project needs to be added as dependency so that the server is detected and attached properly. The pre-defined routes in the CDS server are reused.

### `ui5-middleware-approuter`

[ui5-middleware-approuter](packages/ui5-middleware-approuter/README.md)

Middleware for [ui5-server](https://github.com/SAP/ui5-server), making `destinations` configured in SAP Cloud Foundry or SAP XS Advanced available for local development using the [`http-proxy-middleware`](https://www.npmjs.com/package/http-proxy-middleware).

#### `@sap/approuter`

[@sap/approuter](https://www.npmjs.com/package/@sap/approuter)

The application router is designed to work in XS Advanced - Cloud Foundry and XS OnPremise Runtime.

A calling component accesses a target service by means of the application router only if there is no JWT token available, for example, if a user invokes the application from a Web browser. If a JWT token is already available, for example, because the user has already been authenticated, or the calling component uses a JWT token for its own OAuth client, the calling component calls the target service directly; it does not need to use the application router.

#### `dev-approuter`

[dev-approuter](packages/ui5-middleware-simpleproxy/README.md)

The `dev-approuter` is a development time tooling only for the [SAP Application Router](https://www.npmjs.com/package/@sap/approuter) that can serve [UI5](https://ui5.sap.com/) and [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/) apps that are added as (dev)dependencies to the approuter's `package.json`.

### `ui5-middleware-simpleproxy`

[ui5-middleware-simpleproxy](packages/ui5-middleware-simpleproxy/README.md)

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

### Comparison

The following table shows a small comparison of the different backend connectivity tooling features:

|                           | cds-plugin-ui5       | ui5-middleware-cap | ui5-middleware-approuter | @sap/approuter       | dev-approuter       | ui5-middleware-simpleproxy |
| ------------------------- | -------------------- | ------------------ | ---------------------------- | -------------------- | ------------------- | -------------------------- |
| **Productive Usage**      | :x:                  | :x:                | :x:                          | :white_check_mark:   | :x:                 | :x:                        |
| UAA Support               | (:white_check_mark:) | :x:                | :white_check_mark:           | :white_check_mark:   | :white_check_mark:  | :x:                        |
| BTP Destinations          | :x:                  | :x:                | :white_check_mark:           | :white_check_mark:   | :white_check_mark:  | :x:                        |
| WebSockets                | :x:                  | :x:                | :white_check_mark:           | :white_check_mark:   | :white_check_mark:  | :white_check_mark:         |
|                           |                      |                    |                              |                      |                     |                            |
| **Development Usage**     | :white_check_mark:   | :white_check_mark: | :white_check_mark:           | :white_check_mark:   | :white_check_mark:  | :white_check_mark:         |
| Embedding UI5 Middlewares | :white_check_mark:   | :white_check_mark: | :white_check_mark:           | :x:                  | :white_check_mark:  | :white_check_mark:         |
| Embedding CAP Server      | :x:                  | :white_check_mark: | (:white_check_mark:)`*`      | :x:                  | :white_check_mark:  | (:white_check_mark:)`*`    |
| Mock UAA Support          | :white_check_mark:   | :white_check_mark: | (:white_check_mark:)`*`      | :x:                  | :white_check_mark:  | (:white_check_mark:)`*`    |
| Server processes          | 1                    | 1                  | 2 (UI5 server + AppRouter)   | 1 + required servers | 2 (AppRouter + CAP) | 1 + required servers       |

`*` via Proxy

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/ui5-community/ui5-ecosystem-showcase/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## License

This work is [dual-licensed](LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
