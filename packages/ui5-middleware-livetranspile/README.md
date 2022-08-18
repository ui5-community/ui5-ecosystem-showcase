# UI5 middleware for live transpiling ES6+ sources

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing on-the-fly transpilation of ES6+ sources to ES5 (incl IE11 compatability :) )

:warning: The `ui5-middleware-livetranspile` has been deprecated and replaced with the `ui5-tooling-transpile-middleware`. Please check out the tooling extensions from [ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile).

## Install

```bash
npm install ui5-middleware-livetranspile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
verbose logging

- excludePatterns: `String<Array>`  
array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  
e.g. 3-rd party libs in `lib/*`

- transpileAsync: `true|false`  
transpiling `async/await`  using [this Babel plugin](https://www.npmjs.com/package/babel-plugin-transform-async-to-promises), which doesn't require  
the regenerator runtime ([Issue #242](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/242))

- babelConfig: `Object`  
object to use as configuration for babel instead of the default configuration  
defined in this middleware

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-livetranspile": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-livetranspile",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livetranspile
    afterMiddleware: compression
    configuration:
      debug: true
      transpileAsync: true
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

## How it works

The middleware intercepts every `.js`-file before it is sent to the client. The file is then transpiled on-the-fly via `babel`, including dynamic creation of a `sourcemap`.

The transpiled code and the `sourcemap` are subsequently delivered to the client instead of the original `.js`-file. Because of the `sourcemap`, setting breakpoints in the **original (ES6+) source** will cause the debugger to stop **when the corresponding transpiled source code is reached**.

> `async/await` is transpiled at runtime, but the required `asyncGenerator` sources are not yet delivered on the fly. They need to be `sap.ui.require`d or `<script src="...">`d separately. Alternatively you can use the babel plugin `babel-plugin-transform-async-to-promises` as described [here](../ui5-task-transpile/README.md).

## Extending the default configuration (in `$yourapp/babel.config.json`)

If you want to further customize the transpiling options you can do so by creating a babel config file `babel.config.json` in your project directory. The behavior is identical to that of `ui5-task-transpile`. For more details and examples consult the [documentation of `ui5-task-transpile`](../ui5-task-transpile/README.md).

## Override babel configuration (in `$yourapp/ui5.yaml`)

You can override the default babel configuration from this package by including an object `babelConfig` in this task's configuration. The behavior is identical to that of `ui5-task-transpile`. For more details and examples consult the [documentation of `ui5-task-transpile`](../ui5-task-transpile/README.md).

## Misc/FAQ

`.js`-files requested by the server that are missing in the application (such as `Component-preload.js`) are logged as a `WARN` message, but will not cause the middleware to break/stop.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
