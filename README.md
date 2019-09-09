# ui5-ecosystem-showcase

A repository showcasing the UI5 Tooling ecosystem idea.

## Overview

This repository will showcase the endless possibilities of the UI5 Tooling. The UI5 Tooling extensibility (tasks and middleware) can be used to combine various OSS tools for UI5 application development. This increases the development experience and efficiency and also allows to use well-known tools.

The content of the repository is structured like that:

```text
packages
├── ui5-app                         // the UI5 application using the custom middlewares and tasks
├── ui5-middleware-cfdestination    // middleware extension: use the approuter as proxy
├── ui5-middleware-livereload       // middleware extension: usage of livereload for development
├── ui5-middleware-livetranspile    // middleware extension: on-demand es6 to es5 transpile when requesting js
├── ui5-middleware-simpleproxy      // middleware extension: simple express proxy
└── ui5-task-transpile              // task extension: transpile es6 to es5 code
```

## Getting Started

The `ui5-ecosystem-showcase` repository is a monorepo based on `yarn` workspaces. Instead of `npm` you need yarn to run the project.

```bash
# Install yarn (if not done already)
npm i -g yarn
```

To get started with the project, please ensure to run `yarn` once to install all required dependencies in your node_modules folder.

```bash
# Install the node modules via yarn
yarn
```

To get started just run one of the following commands:

```bash
# use yarn --ignore-engines if you're on node != 8 or 10

# 1) Run the dev mode
# which gives you 
# - live reload of ui5-app/webapp/**/**
# - live transpilation of ui5-app/webapp/**/** on the fly
#   including debug functionality via source maps
#   (attention: async functions not yet supported!)
# - proxy functionality at $server/proxy
# - cf-style proxy destinations at $server/$destinations
yarn dev

# 2) Run the Component-preload build + transpile steps
# which in addition to the above
# - transpiles all ui5-app/webapp/**/* to ui5-app/dist
# - live reload of ui5-app/dist/**/*
yarn watch

# 3) Run the dist folder (but build manually)
yarn start
```

## Using tasks and middlewares in your project

The tasks and middlewares developed in this project are also publically available on NPM *soon*. Right now, you can use them by either linking or also use the yarn workspaces across repositories.

The consumption of the individual tasks and middlewares can be seen inside their local `README.md`.

Available tasks:

* [ui5-task-transpile](packages/ui5-task-transpile/README.md): transpile es6 to es5 code

Available middlewares:

* [ui5-middleware-cfdestination](packages/ui5-middleware-cfdestination/README.md): use the approuter as proxy
* [ui5-middleware-livereload](packages/ui5-middleware-livereload/README.md): usage of livereload for development
* [ui5-middleware-livetranspile](packages/ui5-middleware-livetranspile/README.md): on-demand es6 to es5 transpile when requesting js
* [ui5-middleware-simpleproxy](packages/ui5-middleware-simpleproxy/README.md): simple express proxy

## License

[THE DERIVIED BEER-WARE LICENSE](LICENSE)

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
