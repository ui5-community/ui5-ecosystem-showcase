# UI5 Tooling Extensions for NPM Package Consumption

> **DISCLAIMER**: This is a community project and there is no official support for this package! Also the functionality may stop working at any time in future with newer versions of the UI5 tooling!

The UI5 tooling extensions include a custom middleware and a custom task which allow to use NPM package names for AMD-like dependencies, e.g.:

```bash
# Install a dev dependency to Chart.js (https://www.chartjs.org/)
npm install chart.js --save-dev
```

```js
// use Chart.js as a AMD-like dependency
sap.ui.define([
  "chart.js"
], function(chartjs) {
  [...]
  alert(chartjs.version);
  [...]
})
```

Once the UI5 application is finally built, the Chart.js dependency will be copied into the `dist/resources` folder with the proper namespace. In case of Chart.js above, there is no namespace and thus the location will be `dist/resources/chart.js.js`.

## Install

```bash
npm install ui5-tooling-modules --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- verbose: `boolean`  
  Enables verbose logging (default to `false`)

- prependPathMappings: `boolean`  
  Prepends the path mappings for the UI5 loader to the `Component.js` which allows to run the Component using 3rd party libs in e.g. Fiori launchpad environments (default to `false`)

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

> Hint: In case your application is using a proxy such `fiori-tools-proxy`, the proxy must run after `ui5-tooling-modules-middleware` middleware. Otherwise proxy will try to serve the resources for your installed npm package instead of `ui5-tooling-modules-middleware`. You can achieve this by setting `afterMiddleware: ui5-tooling-modules-middleware` in `fiori-tools-proxy` middleware.

## How it works

The custom middleware is listening to incoming requests and checks those requests to match npm packages. E.g. a dependency to `chart.js` will cause a request to `resource/chart.js.js`. The middleware now derives the module name which is `"chart.js"` and uses `require.resolve("chart.js")` to lookup the npm package for it. If an npm package exists, the middleware is using `rollup` to create a custom AMD bundle for the npm package which uses `sap.ui.define` instead of `define`.

The custom task is scanning all AMD dependencies of all modules and tries to resolve the module names. If a module has been found a custom bundle will be created in the proper namespace of the module, e.g. `@apollo/client/core` will create a custom bundle at `dist/resources/@apollo/client/core.js`.

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
