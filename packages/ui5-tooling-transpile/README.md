# UI5 Tooling Extension for Transpiling JS/TS

> **DISCLAIMER**: This is a community project and there is no official support for this package! Also the functionality may stop working at any time in future with newer versions of the UI5 tooling!

The tooling extension provides a middleware and a task which transpiles JavaScript or TypeScript code to ES5 by using Babel. A default Babel configuration will be provided by the tooling extension unless a inline Babel configuration in the `ui5.yaml` or any Babel configuration as described at [Babel config files](https://babeljs.io/docs/en/config-files) will be provided.

The middleware handles by default all requests to `.js`-files. For JavaScript transpilation the matching `.js`-file or for TypeScript the matching `.ts`-file will be transpiled on-the-fly via Babel. The transpiled JavaScript file will inline the `sourcemap`. Because of the `sourcemap`, setting breakpoints in the **original (ES6+ or TS) source** will cause the debugger to stop **when the corresponding transpiled source code is reached**.

The task finally transpiles the relevant source files during the UI5 Tooling build process. In case of TypeScript is enabled, for libraries, the task also generates the `d.ts`-files. For applications, this option can be enabled on demand.

## Install

```bash
npm install ui5-tooling-transpile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `boolean`  
  enable detailed logging (can be even more verbose by using the `--verbose` argument)

- babelConfig: `Object`
  object to use as configuration for babel instead of the babel configuration from the file system (as described at [Babel config files](https://babeljs.io/docs/en/config-files)), or the default configuration defined in this middleware (just using the `@babel/preset-env`)

- includes: `String<Array>` (old alias: includePatterns)
  array of paths your application to include in transpilation, e.g. `/modern-stuff/`

- excludes: `String<Array>` (old alias: excludePatterns)
  array of paths your application to exclude from transpilation, e.g. 3-rd party libs in `/lib/`

- transpileTypeScript: `boolean`
  if enabled the tooling extensions handle TypeScript files instead of JavaScript files and enable other TypeScript related configuration options (such as `generateDts`) - although `babelConfig` is inlined or available as external Babel configuration file, this option needs to be enabled for TypeScript support but in such cases the [`@babel/preset-typescript`](https://babeljs.io/docs/babel-preset-typescript) needs to be included manually in the Babel configuration

- filePattern: `String`
  source file pattern for the resources to transpile, defaults to `.js` and will be changed to `.ts` if `transpileTypeScript` is set to `true` (to handle multiple file extensions you can specify the extensions like that: `.+(js|jsx)` or `.+(ts|tsx)`)

- generateDts: `boolean`
  if enabled, the tooling extension will generate the d.ts files (for projects of type `library` this option is considered as `true` (enabled) by default and for other projects such as `application` this option is considered as `false` (disabled by default)

- transpileDependencies: `boolean` (*experimental feature*)
  if enabled, the middleware also transpile the TypeScript sources from the dependencies which is needed for development scenarios when referring to other TypeScript projects - the task ignores this configuration option

The following configuration options will only be taken into account if no inline babel configuration is maintained in the `ui5.yaml` as `babelConfig` or no external babel configuration exists in any configuration file as described in [Babels configuration section](https://babeljs.io/docs/configuration):

- transpileTypeScript: `boolean`
  includes the Babel presets [`@babel/preset-typescript`](https://babeljs.io/docs/babel-preset-typescript) and [`babel-preset-transform-ui5`](https://github.com/ui5-community/babel-plugin-transform-modules-ui5) into Babels preset configuration (if `transformModulesToUI5` is explicitely set to `false` the `babel-preset-transform-ui5` will not be added to the presets)

- targetBrowsers: `String` (default: [`"defaults"`](https://browsersl.ist/#q=defaults))
  first, the config will be looked up in the `package.json` `browserslist` property, second the config is searched in an external `.browserlistrc` file and if nothing has been found, the targeted browsers can be defined with the shared browser compatibility config from [browserslist](https://github.com/browserslist/browserslist) within this configuration option; to transpile back to ES5 you can i.e. use the browserslist configuration: `">0.2% and not dead"`

- transformModulesToUI5: `boolean`
  includes the [`babel-preset-transform-ui5`](https://github.com/ui5-community/babel-plugin-transform-modules-ui5) into Babels preset configuration (included implicitly when `transpileTypeScript` is set to `true` and this configuration option is omitted); this preset ensures that ES module `import`s will be transpiled to UI5 classic `sap.ui.define` or `sap.ui.require` calls and ES UI5 classes to classic UI5 classes using the `extend` API

- transformAsyncToPromise: `boolean` (old: `transpileAsync`)
  includes the [`babel-plugin-transform-async-to-promises`](https://www.npmjs.com/package/babel-plugin-transform-async-to-promises) into Babels presert configuration which transpiles `async/await` statements into `Promise`s; otherwise Babel uses `@babel/plugin-transform-regenerator` to transpile `async/await` with [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) which isn't [CSP](https://en.wikipedia.org/wiki/Content_Security_Policy) compliant

- removeConsoleStatements: `boolean`  
  includes the [babel-plugin-transform-remove-console](https://babeljs.io/docs/en/babel-plugin-transform-remove-console) which removes the console statement from the transpiled code

## Setup

Define the dependency in `$yourapp/package.json`:

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

> :warning: As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.
>
> :speech_balloon: For UI5 Tooling 3.0 the `ui5 > dependencies` section in the `package.json` isn't necessary anymore and can be removed.

### Configuration of `ui5.yaml` for JavaScript

The configuration for the custom task:

```yaml
builder:
  customTasks:
  - name: ui5-tooling-transpile-task
    afterTask: replaceVersion
    configuration:
      debug: true
      removeConsoleStatements: true
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
      removeConsoleStatements: true
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

### Configuration of `ui5.yaml` for TypeScript

The configuration for the custom task:

```yaml
builder:
  customTasks:
  - name: ui5-tooling-transpile-task
    afterTask: replaceVersion
    configuration:
      debug: true
      transpileTypeScript: true
      removeConsoleStatements: true
```

The configuration for the custom middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-tooling-transpile-middleware
    afterMiddleware: compression
    configuration:
      debug: true
      transpileTypeScript: true
      removeConsoleStatements: true
```

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
