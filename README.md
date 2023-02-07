# ui5-ecosystem-showcase

A repository showcasing the UI5 Tooling ecosystem idea.

[![OpenUI5 Community Slack (#tooling channel)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://join-ui5-slack.herokuapp.com)

## Overview

This repository showcases the endless possibilities of the UI5 Tooling. The UI5 Tooling extensibility (tasks and middleware) can be used to combine various OSS tools for UI5 application development. This increases the development experience and efficiency and also allows to use well-known tools.

The content of the repository is structured like that:

```text
packages
├── ui5-app                         // the UI5 application using the custom middlewares and tasks
├── ui5-middleware-cfdestination    // middleware extension: use the approuter as proxy
├── ui5-middleware-iasync           // middleware extension: sync UI interaction across browsers (alpha! careful!)
├── ui5-middleware-index            // middleware extension: serve an HTML file for / (root)
├── ui5-middleware-livecompileless  // middleware extension: livecompiling of less files in the app folder
├── ui5-middleware-livereload       // middleware extension: usage of livereload for development
├── ui5-middleware-onelogin         // middleware extension: enable a generic login support
├── ui5-middleware-servestatic      // middleware extension: serve static resources
├── ui5-middleware-simpleproxy      // middleware extension: simple express proxy
├── ui5-middleware-webjars          // middleware extension: deliver content from JAR files
├── ui5-task-cachebuster            // task extension: enables cachebusting for standalone applications
├── ui5-task-compileless            // task extension: compile less files in the app folder
├── ui5-task-flatten-library        // task extension: prepares build result for deployment to SAP NetWeaver
├── ui5-task-i18ncheck              // task extension: checks for missing i18n texts
├── ui5-task-minify-xml             // task extension: minify xml resources
├── ui5-task-pwa-enabler            // task extension: enables ui5 app with pwa functionalities
├── ui5-task-zipper                 // task extension: bundle the entire webapp in a zip-archive
├── ui5-tooling-modules             // tooling extensions: direct consumption of NPM packages in UI5 apps
├── ui5-tooling-stringreplace      // tooling extension: replaces placeholder strings
└── ui5-tooling-transpile           // tooling extensions: transpile resources using Babel
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
* https://www.npmjs.com/package/ui5-task-compileless
* https://www.npmjs.com/package/ui5-task-flatten-library
* https://www.npmjs.com/package/ui5-task-minify-xml
* https://www.npmjs.com/package/ui5-task-i18ncheck 
* https://www.npmjs.com/package/ui5-task-pwa-enabler
* https://www.npmjs.com/package/ui5-task-zipper

The middlewares developed in this monorepo are also publicly available on NPM right here:

* https://www.npmjs.com/package/ui5-middleware-cfdestination
* https://www.npmjs.com/package/ui5-middleware-iasync (alpha! careful!)
* https://www.npmjs.com/package/ui5-middleware-index
* https://www.npmjs.com/package/ui5-middleware-livecompileless
* https://www.npmjs.com/package/ui5-middleware-livereload
* https://www.npmjs.com/package/ui5-middleware-onelogin
* https://www.npmjs.com/package/ui5-middleware-servestatic
* https://www.npmjs.com/package/ui5-middleware-simpleproxy
* https://www.npmjs.com/package/ui5-middleware-webjars

The tooling extensions (contains tasks and middlewares) developed in this monorepo are available on NPM right here:

* https://www.npmjs.com/package/ui5-tooling-modules
* https://www.npmjs.com/package/ui5-tooling-stringreplace
* https://www.npmjs.com/package/ui5-tooling-transpile

The consumption of the individual tasks and middlewares can be seen inside their local `README.md`.

Available tasks in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-task-cachebuster](https://www.npmjs.com/package/ui5-task-cachebuster) | enables cachebusting for standalone applications | [![npm version](https://badge.fury.io/js/ui5-task-cachebuster.svg)](https://badge.fury.io/js/ui5-task-cachebuster) |
| [ui5-task-compileless](https://www.npmjs.com/package/ui5-task-compileless) | compile less files in the app folder | [![npm version](https://badge.fury.io/js/ui5-task-compileless.svg)](https://badge.fury.io/js/ui5-task-compileless) |
| [ui5-task-flatten-library](https://www.npmjs.com/package/ui5-task-flatten-library) | prepares build result for deployment to SAP NetWeaver | [![npm version](https://badge.fury.io/js/ui5-task-flatten-library.svg)](https://badge.fury.io/js/ui5-task-flatten-library) |
| [ui5-task-i18ncheck](packages/ui5-task-i18ncheck/README.md) | checks for missing i18n texts | [![npm version](https://badge.fury.io/js/ui5-task-i18ncheck.svg)](https://badge.fury.io/js/ui5-task-i18ncheck) |
| [ui5-task-minify-xml](packages/ui5-task-minify-xml/README.md) | minify xml resources | [![npm version](https://badge.fury.io/js/ui5-task-minify-xml.svg)](https://badge.fury.io/js/ui5-task-minify-xml) |
| [ui5-task-pwa-enabler](packages/ui5-task-pwa-enabler/README.md) | enables ui5 app with pwa functionalities | [![npm version](https://badge.fury.io/js/ui5-task-pwa-enabler.svg)](https://badge.fury.io/js/ui5-task-pwa-enabler) |
| [ui5-task-zipper](packages/ui5-task-zipper/README.md) | bundle the entire webapp in a zip-archive | [![npm version](https://badge.fury.io/js/ui5-task-zipper.svg)](https://badge.fury.io/js/ui5-task-zipper) |

Available middlewares in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-middleware-cfdestination](packages/ui5-middleware-cfdestination/README.md) | use the approuter as proxy | [![npm version](https://badge.fury.io/js/ui5-middleware-cfdestination.svg)](https://badge.fury.io/js/ui5-middleware-cfdestination) |
| [ui5-middleware-iasync](packages/ui5-middleware-iasync/README.md) | sync UI interactions across connected browsers (alpha! careful!) | [![npm version](https://badge.fury.io/js/ui5-middleware-iasync.svg)](https://badge.fury.io/js/ui5-middleware-iasync) |
| [ui5-middleware-index](packages/ui5-middleware-index/README.md) | serve an HTML file for / (root) | [![npm version](https://badge.fury.io/js/ui5-middleware-index.svg)](https://badge.fury.io/js/ui5-middleware-index) |
| [ui5-middleware-livecompileless](https://www.npmjs.com/package/ui5-middleware-livecompileless) | livecompiling of less files in the app folder | [![npm version](https://badge.fury.io/js/ui5-middleware-livecompileless.svg)](https://badge.fury.io/js/ui5-middleware-livecompileless) |
| [ui5-middleware-livereload](packages/ui5-middleware-livereload/README.md) | usage of livereload for development | [![npm version](https://badge.fury.io/js/ui5-middleware-livereload.svg)](https://badge.fury.io/js/ui5-middleware-livereload) |
| [ui5-middleware-servestatic](packages/ui5-middleware-servestatic/README.md) | serve static resources | [![npm version](https://badge.fury.io/js/ui5-middleware-servestatic.svg)](https://badge.fury.io/js/ui5-middleware-servestatic) |
| [ui5-middleware-onelogin](packages/ui5-middleware-onelogin/README.md) | enable a generic login support | [![npm version](https://badge.fury.io/js/ui5-middleware-onelogin.svg)](https://badge.fury.io/js/ui5-middleware-onelogin) |
| [ui5-middleware-simpleproxy](packages/ui5-middleware-simpleproxy/README.md) | simple express proxy | [![npm version](https://badge.fury.io/js/ui5-middleware-simpleproxy.svg)](https://badge.fury.io/js/ui5-middleware-simpleproxy) |
| [ui5-middleware-webjars](packages/ui5-middleware-webjars/README.md) | deliver content from JAR files | [![npm version](https://badge.fury.io/js/ui5-middleware-webjars.svg)](https://badge.fury.io/js/ui5-middleware-webjars) |

Available tooling extensions in this project:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-tooling-modules](packages/ui5-tooling-modules/README.md) | direct consumption of NPM packages | [![npm version](https://badge.fury.io/js/ui5-tooling-modules.svg)](https://badge.fury.io/js/ui5-tooling-modules) |
| [ui5-tooling-stringreplace](packages/ui5-tooling-stringreplace/README.md) | stringreplace resources using Babel | [![npm version](https://badge.fury.io/js/ui5-tooling-stringreplace.svg)](https://badge.fury.io/js/ui5-tooling-stringreplace) |
| [ui5-tooling-transpile](packages/ui5-tooling-transpile/README.md) | transpile resources using Babel | [![npm version](https://badge.fury.io/js/ui5-tooling-transpile.svg)](https://badge.fury.io/js/ui5-tooling-transpile) |

## License

This work is [dual-licensed](LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
