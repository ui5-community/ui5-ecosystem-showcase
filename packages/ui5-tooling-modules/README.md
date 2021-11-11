# UI5 Tooling Extensions for NPM Package Consumption

> **DISCLAIMER**: This is a community project and there is no official support for this package! Also the functionality may stop working at any time in future with newer versions of the UI5 tooling!

The UI5 tooling extensions include a custom middleware and a custom task which allow to use NPM package names for AMD-like dependencies, e.g.:

```bash
# Install a dev dependency to D3
npm install d3 --save-dev
```

```js
// use D3 as a AMD-like dependency
sap.ui.define([
  "d3"
], function(d3) {
  [...]
  alert(d3.version);
  [...]
})
```

Once the UI5 application is finally built, the D3 dependency will be copied into the `dist/resources` folder with the proper namespace. In case of D3 above, there is no namespace and thus the location will be `dist/resources/d3.js`.

## Install

```bash
npm install ui5-tooling-modules --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- verbose: `boolean`  
  Enables verbose logging (default to `false`)

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-tooling-modules": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-tooling-modules",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. Configure it in `$yourapp/ui5.yaml`:

The configuration for the custom task:

```yaml
builder:
  customTasks:
  - name: ui5-tooling-modules-task
    afterTask: replaceVersion
```

The configuration for the custom middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-tooling-modules-middleware
    afterMiddleware: compression
```

## How it works

The custom middleware is listening to incoming requests and checks those requests to match npm packages. E.g. a dependency to `d3` will cause a request to `resource/d3.js`. The middleware now derives the module name which is `"d3"` and uses `require.resolve("d3")` to lookup the npm package for it. If an npm package exists, the middleware is using `rollup` to create a custom AMD bundle for the npm package which uses `sap.ui.define` instead of `define`.

The custom task is scanning all AMD dependencies of all modules and tries to resolve the module names. If a module has been found a custom bundle will be created in the proper namespace of the module, e.g. `@apollo/client/core` will create a custom bundle at `dist/resources/@apollo/client/core.js`.

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
