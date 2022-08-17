# UI5 Tooling Extensions for JS/TS transpiling

> **DISCLAIMER**: This is a community project and there is no official support for this package! Also the functionality may stop working at any time in future with newer versions of the UI5 tooling!

## Install

```bash
npm install ui5-tooling-transpile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`  
  verbose logging

- removeConsoleStatements: `true|false`  
  remove console statements while transpiling using [Babel plugin](https://babeljs.io/docs/en/babel-plugin-transform-remove-console)

- excludePatterns: `String<Array>`  
  array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  
  e.g. 3-rd party libs in `lib/*`

- transpileAsync: `true|false`  
  transpiling `async/await` using [this Babel plugin](https://www.npmjs.com/package/babel-plugin-transform-async-to-promises), which doesn't require  
  the regenerator runtime ([Issue #242](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/242))

- transpileTypeScript: `true|false`
  transpiling TS sources into UI5

- babelConfig: `Object`
  object to use as configuration for babel instead of the  
  default configuration defined in this middleware

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-tooling-transpile": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-tooling-transpile",
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
  - name: ui5-tooling-transpile-task
    afterTask: replaceVersion
    configuration:
      debug: true
      removeConsoleStatements: true
      transpileAsync: true
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

The configuration for the custom middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-tooling-transpile-middleware
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

The custom middleware intercepts every `.js/.ts`-file before it is sent to the client. The file is then transpiled on-the-fly via `babel`, including dynamic creation of a `sourcemap`.

The transpiled code and the `sourcemap` are subsequently delivered to the client instead of the original `.js/.ts`-file. Because of the `sourcemap`, setting breakpoints in the **original (ES6+) source** will cause the debugger to stop **when the corresponding transpiled source code is reached**.

> `async/await` is transpiled at runtime, but the required `asyncGenerator` sources are not yet delivered on the fly. They need to be `sap.ui.require`d or `<script src="...">`d separately. Alternatively you can use the babel plugin `babel-plugin-transform-async-to-promises` as described [here](../ui5-task-transpile/README.md).

The custom task can be used to transpile ES6+ JavaScript ot Typescript code to ES5 by using `babel`.

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
