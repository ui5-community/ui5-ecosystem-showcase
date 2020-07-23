# UI5 task for transpiling ES6+ sources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling transpiling.

## Install

```bash
npm install ui5-task-transpile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`
verbose logging

- removeConsoleStatements: `true|false`
remove console statements while transpiling using [Babel plugin](https://babeljs.io/docs/en/babel-plugin-transform-remove-console)

- transpileAsync: `true|false`
transpiling `async/await` using [this Babel plugin](https://www.npmjs.com/package/babel-plugin-transform-async-to-promises), which doesn't require the regenerator runtime ([Issue #242](https://github.com/petermuessig/ui5-ecosystem-showcase/issues/242))

- excludePatterns: `String<Array>`
array of paths inside `$yourapp/webapp/` to exclude from live transpilation,
e.g. 3-rd party libs in `lib/*`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-transpile": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-transpile",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-transpile
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

## How it works

The task can be used to transpile ES6+ JavaScript code to ES5 by using `babel`.

## Extended configuration (in `$yourapp/babel.config.json`)

If you want to further customize the transpiling options you can do so by creating a babel config file `babel.config.json` in your project directory. Babel will automatically pick up the configuration and apply it. The default configuration from this task will still be applied.

### Example

An example configuration is as follows:

```json
{
  "plugins": [
    ["@babel/plugin-transform-for-of", { "assumeArray": true }],
    ["@babel/plugin-transform-computed-properties", { "loose": true }],
    ["@babel/plugin-transform-destructuring", { "loose": true }]
  ]
}
```

### Additional dependencies

If you need dependencies not included in this task you have to install them in your project in order to use them.

For example, in order to transpile `async`/`await` to `Promise`s you can install
`babel-plugin-transform-async-to-promises` as development dependency to your project and add it to the babel configuration's `plugins` section:

```json
{
  "plugins": [
    // ...
    ["babel-plugin-transform-async-to-promises", { "inlineHelpers": true }]
    // ...
  ]
}
```

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.