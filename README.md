# ui5-ecosystem-showcase

A repository showcasing the UI5 Tooling ecosystem idea.

## Overview

This repository will showcase the endless possibilities of the UI5 Tooling. The UI5 Tooling extensibility (tasks and middleware) can be used to combine various OSS tools for UI5 application development. This increases the development experience and efficiency and also allows to use well-known tools.

The content of the repository is structured like that:

```text
packages
├── ui5-app                         // the UI5 application using the custom middlewares and tasks
├── ui5-middleware-cfdestination    // middleware extension: use the approuter as proxy
├── ui5-middleware-iasync           // middleware extension: sync UI interaction across browsers (alpha! careful!)
├── ui5-middleware-livereload       // middleware extension: usage of livereload for development
├── ui5-middleware-livetranspile    // middleware extension: on-demand es6 to es5 transpile when requesting js
├── ui5-middleware-simpleproxy      // middleware extension: simple express proxy
├── ui5-middleware-servestatic      // middleware extension: serve static resources
├── ui5-task-transpile              // task extension: transpile es6 to es5 code
└── ui5-task-zipper                 // task extension: bundle the entire webapp in a zip-archive
```

## Getting Started

The `ui5-ecosystem-showcase` repository is a monorepo based on `yarn` workspaces. Instead of `npm` you need yarn to run the project.

```bash
# Install yarn (if not done already)
npm i -g yarn
```

To get started with the project, please ensure to run `yarn` once to install all required dependencies in your node_modules folder.

```bash
# use yarn --ignore-engines if you're on node != 8 or 10

# Install the node modules via yarn
yarn --ignore-engines
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
yarn dev

# 2) Run the Component-preload build + transpile steps
# which in addition to the above
# - transpiles all ui5-app/webapp/**/* to ui5-app/dist
# - live reload of ui5-app/dist/**/*
yarn watch

# 3) Run the dist folder (but build manually)
yarn start

# 4) Run Unit-(QUnit-)Tests and Integration-(OPA5-)Tests
# against "as-is" sources in /webapp/* (of /packages/ui5-app)
# with Chrome
# note: no transpiling, no bundling/building
yarn test
# run w/ Headless Chrome and provide coverage report in console
yarn test:ci
```

## Using tasks and middlewares in your project

The tasks and middlewares developed in this project are also publicly available on NPM right here:
 
* https://www.npmjs.com/package/ui5-task-transpile
* https://www.npmjs.com/package/ui5-task-zipper
* https://www.npmjs.com/package/ui5-middleware-cfdestination
* https://www.npmjs.com/package/ui5-middleware-iasync (alpha! careful!)
* https://www.npmjs.com/package/ui5-middleware-livereload
* https://www.npmjs.com/package/ui5-middleware-livetranspile
* https://www.npmjs.com/package/ui5-middleware-simpleproxy
* https://www.npmjs.com/package/ui5-middleware-servestatic

The consumption of the individual tasks and middlewares can be seen inside their local `README.md`.

Available tasks:

* [ui5-task-transpile](packages/ui5-task-transpile/README.md): transpile es6 to es5 code
* [ui5-task-zipper](packages/ui5-task-zipper/README.md): bundle the entire webapp in a zip-archive

Available middlewares:

* [ui5-middleware-cfdestination](packages/ui5-middleware-cfdestination/README.md): use the approuter as proxy
* [ui5-middleware-iasync](packages/ui5-middleware-iasync/README.md): sync UI interactions across connected browsers (alpha! careful!)
* [ui5-middleware-livereload](packages/ui5-middleware-livereload/README.md): usage of livereload for development
* [ui5-middleware-livetranspile](packages/ui5-middleware-livetranspile/README.md): on-demand es6 to es5 transpile when requesting js
* [ui5-middleware-simpleproxy](packages/ui5-middleware-simpleproxy/README.md): simple express proxy
* [ui5-middleware-servestatic](packages/ui5-middleware-servestatic/README.md): serve static resources

## License

This work is [dual-licensed](LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
