# UI5 task for transpiling ES6+ sources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling transpiling.

:warning: The `ui5-task-transpile` has been deprecated and replaced with the `ui5-tooling-transpile-task`. Please check out the tooling extensions from [ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile).

## Install

```bash
npm install ui5-task-transpile --save-dev
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

- babelConfig: `Object`
  object to use as configuration for babel instead of the  
  default configuration defined in this middleware

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

## Extending the default configuration (in `$yourapp/babel.config.json`)

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

If you need dependencies not included in this task you have to install them in your project in order to be able to use them.

## Override babel configuration (in `$yourapp/ui5.yaml`)

You can override the default babel configuration from this package by including an object `babelConfig` in this task's configuration. If such an object is given the default configuration from this task will not be considered, but only the configuration given in `ui5.yaml` will be used.

### Example

```yaml
builder:
  customTasks:
    - name: ui5-task-transpile
      afterTask: replaceVersion
      configuration:
        excludePatterns:
          - "lib/"
        babelConfig: &babelConfig
          plugins:
            - - "@babel/plugin-transform-computed-properties"
              - loose: true
            - - "@babel/plugin-transform-for-of"
              - assumeArray: true
          presets:
            - - "@babel/preset-env"
              - targets:
                  browsers: "last 2 versions, ie 10-11"
```

> Hint: if you also use use `ui5-middleware-livetranspile` you probably do not want to duplicate the babel configuration in your `ui5.yaml`. Use YAML anchors in order to reference the babel configuration across the `ui5.yaml` file.
> In the example above the anchor `&babelConfig` defines the babel configuration of `ui5-task-transpile` and may be re-used in other parts of `ui5.yaml` by using the alias `*babelConfig`:
>
> ```yaml
> server:
>   customMiddleware:
>   - name: ui5-middleware-livetranspile
>     afterMiddleware: compression
>     configuration:
>       babelConfig:
>         <<: *babelConfig
>         sourceMaps: "inline"
> ```

### Additional dependencies

If you need dependencies not included in this task you have to install them in your project in order to be able to use them.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
