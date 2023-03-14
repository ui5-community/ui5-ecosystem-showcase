# UI5 Tooling Extensions for JS/TS transpiling

> **DISCLAIMER**: This is a community project and there is no official support for this package! Also the functionality may stop working at any time in future with newer versions of the UI5 tooling!

## Install

```bash
npm install ui5-tooling-transpile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`  
  enable basic logging

- verbose: `true|false`  
  enable verbose logging

- babelConfig: `Object`
  object to use as configuration for babel instead of the babel configuration from the file system (as described at [Babel config files](https://babeljs.io/docs/en/config-files)), or the default configuration defined in this middleware (just using the `@babel/preset-env`)

- includes: `String<Array>` (old alias: includePatterns)
  array of paths your application to include in transpilation, e.g. `/modern-stuff/`

- excludes: `String<Array>` (old alias: excludePatterns)
  array of paths your application to exclude from transpilation, e.g. 3-rd party libs in `/lib/`

- filePattern: `String`
  source file pattern for the resources to transpile, defaults to `.js`; to handle multiple file extensions you can specify the extensions like that: `.+(js|jsx)` or `.+(ts|tsx)`

- transpileTypeScript: `true|false`
  flag is only supported if no `filePattern` is provided; flag to set the value of `filePattern` to either `.ts` if true (transpiling TypeScript) or `.js` if false

- transpileDependencies: `true|false`
  if option is enabled, the tooling extensions also transpile the TypeScript sources from the dependencies (*experimental feature*)

- transpileAsync: `true|false`  
  flag is only supported if no `babelConfig` is provided; transpiling `async/await` using [this Babel plugin](https://www.npmjs.com/package/babel-plugin-transform-async-to-promises), which doesn't require the regenerator runtime ([Issue #242](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/242))

- removeConsoleStatements: `true|false`  
  flag is only supported if no `babelConfig` is provided; removes console statements while transpiling using [Babel plugin](https://babeljs.io/docs/en/babel-plugin-transform-remove-console)

- generateDTS: `true|false`
  if option is enabled, the tooling extension will generate the d.ts files (for projects of type `library` this option is considered as `true` (enabled) by default and for other projects such as `application` this option is considered as `false` (disabled) by default)

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

The custom middleware handles all requests to `.js`-files. The file is then transpiled on-the-fly via `babel`, including dynamic creation of `sourcemap`s.

The transpiled code and the `sourcemap` are subsequently delivered to the client instead of the original `.js/.ts`-file. Because of the `sourcemap`, setting breakpoints in the **original (ES6+) source** will cause the debugger to stop **when the corresponding transpiled source code is reached**.

> `async/await` is transpiled at runtime, but the required `asyncGenerator` sources are not yet delivered on the fly. They need to be `sap.ui.require`d or `<script src="...">`d separately. Alternatively you can use the option `transpileAsync` which transpiles the `async/await` into `Promise`s.

By default the tooling extensions can be used to transpile ES6+ JavaScript ot Typescript code to ES5 by using `babel`. By enabling the option `transpileTypeScript` the tooling extensions can be used to transpile your TypeScript sources into JavaScript.

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
