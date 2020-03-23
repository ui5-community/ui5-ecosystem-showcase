# UI5 Tooling - Ecosystem Showcase

This repository is showcasing the [UI5 Tooling](https://sap.github.io/ui5-tooling/) extensibility capabilities. You can easily extend the UI5 Tooling with your own [tasks](https://sap.github.io/ui5-tooling/pages/extensibility/CustomTasks/) or [middlewares](https://sap.github.io/ui5-tooling/pages/extensibility/CustomServerMiddleware/). This doesn't necessarily need to happen in this repository and everyone can develop and share his own tasks and middleware via [npm](https://www.npmjs.com/). Regarding npm, please prefix the name of all tasks with `ui5-task-` and all middlewares with `ui5-middleware-`. This will help UI5 developers to easily find tasks and middlewares created and shared by the UI5 community.

## Contributing vs. Self-managed

This repository is open to anyone who wants to share his task or middleware with the UI5 community. By integrating an extension in this repository you can benefit from automated releases of the tasks and middlewares to the public npm registry. In addition, you will get a review before your task or middleware is merged. But if you prefer to manage your repository and release on your own, you can also do so. But in this case, please create a PR for this page to list your task or middleware here and share it with the UI5 community!

## Available Tasks and Middlewares

Below you can find the list of available tasks and middlewares. Please share your own tasks and middlewares here by extending the list of available extensions [here](https://github.com/petermuessig/ui5-ecosystem-showcase/edit/master/docs/index.md).

## Available Tasks

The following tasks (know to this page) have been created and are available in the public NPM registry:

* [ui5-task-transpile](https://www.npmjs.com/package/ui5-task-transpile): transpile es6 to es5 code
* [ui5-task-zipper](https://www.npmjs.com/package/ui5-task-zipper): bundle the entire webapp in a zip-archive

There might be more tasks in the public NPM registry. You can find all tasks which applied the suggested naming convention [here](https://www.npmjs.com/search?q=ui5-task-).

## Available Middlewares

The following middlewares (know to this page) have been created and are available in the public NPM registry:

* [ui5-middleware-cfdestination](https://www.npmjs.com/package/ui5-middleware-cfdestination): use the approuter as proxy
* [ui5-middleware-iasync](https://www.npmjs.com/package/ui5-middleware-iasync): sync UI interactions across connected browsers (alpha! careful!)
* [ui5-middleware-livereload](https://www.npmjs.com/package/ui5-middleware-livereload): usage of livereload for development
* [ui5-middleware-livetranspile](https://www.npmjs.com/package/ui5-middleware-livetranspile): on-demand es6 to es5 transpile when requesting js
* [ui5-middleware-simpleproxy](https://www.npmjs.com/package/ui5-middleware-simpleproxy): simple express proxy
* [ui5-middleware-servestatic](https://www.npmjs.com/package/ui5-middleware-servestatic): serve static resources

There might be more middlewares in the public NPM registry. You can find all middlewares which applied the suggested naming convention [here](https://www.npmjs.com/search?q=ui5-middleware-).
