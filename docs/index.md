# UI5 Tooling - Ecosystem Showcase

[![OpenUI5 Community Slack (#tooling channel)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://join-ui5-slack.herokuapp.com)

This repository is showcasing the [UI5 Tooling](https://sap.github.io/ui5-tooling/) extensibility capabilities. You can easily extend the UI5 Tooling with your own [tasks](https://sap.github.io/ui5-tooling/pages/extensibility/CustomTasks/) or [middlewares](https://sap.github.io/ui5-tooling/pages/extensibility/CustomServerMiddleware/).

![UI5 Tooling Ecosystem](ui5eco.jpg "UI5 Tooling Ecosystem")

This doesn't necessarily need to happen in this repository and everyone can develop and share his own tasks and middleware via [npm](https://www.npmjs.com/). Regarding npm, please prefix the name of all tasks with `ui5-task-` and all middlewares with `ui5-middleware-`. This will help UI5 developers to easily find tasks and middlewares created and shared by the UI5 community.

## Contributing vs. Self-managed

This repository is open to anyone who wants to share his/her task or middleware with the UI5 community. By integrating an extension in this repository you can benefit from automated releases of the tasks and middlewares to the public npm registry. In addition, you will get a review before your task or middleware is merged. But if you prefer to manage your repository and release on your own, you can also do so. But in this case, please create a PR for this page to list your task or middleware here and share it with the UI5 community!

## Available Tasks and Middlewares

Below you can find the list of available tasks and middlewares. Please share your own tasks and middlewares here by extending the list of available extensions [here](https://github.com/petermuessig/ui5-ecosystem-showcase/edit/master/docs/index.md).

## Available Tasks

The following tasks (know to this page) have been created and are available in the public NPM registry:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-task-transpile](https://www.npmjs.com/package/ui5-task-transpile) | transpile es6 to es5 code | [![npm version](https://badge.fury.io/js/ui5-task-transpile.svg)](https://badge.fury.io/js/ui5-task-transpile) |
| [ui5-task-zipper](https://www.npmjs.com/package/ui5-task-zipper) | bundle the entire webapp in a zip-archive | [![npm version](https://badge.fury.io/js/ui5-task-zipper.svg)](https://badge.fury.io/js/ui5-task-zipper) |
| [ui5-task-minifier](https://github.com/mauriciolauffer/ui5-task-minifier) | minify HTML/CSS/JSON files | [![npm version](https://badge.fury.io/js/ui5-task-minifier.svg)](https://badge.fury.io/js/ui5-task-minifier) |
| [ui5-task-transpile-gen](https://www.npmjs.com/package/ui5-task-transpile-gen) | transpile es6 to es5 code including Async Await syntax | [![npm version](https://badge.fury.io/js/ui5-task-transpile-gen.svg)](https://badge.fury.io/js/ui5-task-transpile-gen) |

There might be more tasks in the public NPM registry. You can find all tasks which applied the suggested naming convention via [https://www.npmjs.com/search?q=ui5-task-](https://www.npmjs.com/search?q=ui5-task-).

## Available Middlewares

The following middlewares (know to this page) have been created and are available in the public NPM registry:

| NPM package | Description | Badge |
| ----------- | ----------- | ----- |
| [ui5-middleware-cfdestination](https://www.npmjs.com/package/ui5-middleware-cfdestination) | use the approuter as proxy | [![npm version](https://badge.fury.io/js/ui5-middleware-cfdestination.svg)](https://badge.fury.io/js/ui5-middleware-cfdestination) |
| [ui5-middleware-iasync](https://www.npmjs.com/package/ui5-middleware-iasync) | sync UI interactions across connected browsers (alpha! careful!) | [![npm version](https://badge.fury.io/js/ui5-middleware-iasync.svg)](https://badge.fury.io/js/ui5-middleware-iasync) |
| [ui5-middleware-index](packages/ui5-middleware-index/README.md) | serve an HTML file for / (root) | [![npm version](https://badge.fury.io/js/ui5-middleware-index.svg)](https://badge.fury.io/js/ui5-middleware-index) |
| [ui5-middleware-livereload](https://www.npmjs.com/package/ui5-middleware-livereload) | usage of livereload for development | [![npm version](https://badge.fury.io/js/ui5-middleware-livereload.svg)](https://badge.fury.io/js/ui5-middleware-livereload) |
| [ui5-middleware-livetranspile](https://www.npmjs.com/package/ui5-middleware-livetranspile) | on-demand es6 to es5 transpile when requesting js | [![npm version](https://badge.fury.io/js/ui5-middleware-livetranspile.svg)](https://badge.fury.io/js/ui5-middleware-livetranspile) |
| [ui5-middleware-simpleproxy](https://www.npmjs.com/package/ui5-middleware-simpleproxy) | simple express proxy | [![npm version](https://badge.fury.io/js/ui5-middleware-simpleproxy.svg)](https://badge.fury.io/js/ui5-middleware-simpleproxy) |
| [ui5-middleware-servestatic](https://www.npmjs.com/package/ui5-middleware-servestatic) | serve static resources | [![npm version](https://badge.fury.io/js/ui5-middleware-servestatic.svg)](https://badge.fury.io/js/ui5-middleware-servestatic) |
| [ui5-middleware-route-proxy](https://www.npmjs.com/package/ui5-middleware-route-proxy) | Proxy to forward request for a specific route | [![npm version](https://badge.fury.io/js/ui5-middleware-route-proxy.svg)](https://badge.fury.io/js/ui5-middleware-route-proxy) |

There might be more middlewares in the public NPM registry. You can find all middlewares which applied the suggested naming convention at [https://www.npmjs.com/search?q=ui5-middleware-](https://www.npmjs.com/search?q=ui5-middleware-).
