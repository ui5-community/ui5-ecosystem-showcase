# UI5 Tooling Extensions for NPM Package Consumption

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The UI5 tooling extensions include a custom middleware and a custom task which allow to use NPM package names for AMD-like dependencies, e.g.:

```bash
# Install a dev dependency to Chart.js (https://www.chartjs.org/)
npm install chart.js
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

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-tooling-modules --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

The following configuration options are relevant for the `task` and the `middleware`:

- *debug*: `boolean|string`  
  Enables debug logging (defaults to `false`), by setting value to `"verbose"` the extension will log even more detailed
  &nbsp;

- *skipCache*: `boolean`
  For development scenarios, the module cache can be disabled by setting this option to true. Normally, if a module changes (e.g. bundledefs), this change is detected and the bundle is recreated. This just forces the regeneration always (defaults to `false`)
  &nbsp;

- *persistentCache*: `boolean` *experimental feature*
  With this option, the bundle information will be persistent and will be available again after the restart of the development server or for the next execution of your build task. The bundle information is stored in the working directory in the folder `.ui5-tooling-modules` folder. It's recommended to put this folder into `.gitignore` (defaults to `false`)
  &nbsp;

- *keepDynamicImports*: `boolean|String[]` *experimental feature*
  An arrays of NPM package names for which the dynamic imports with a generic target module (e.g. `import(anyUrl)`) will not be converted into a `require` based polyfill. If the value is a boolean, it activates/deactivates the feature for all modules (by default it is active!). This experimental feature is useful in scenarios loading ES modules dynamically from generic URLs. All dynamic imports resolving a concrete module (e.g. `import("jspdf")`) will be converted into chunks and loaded with a `require` call.
  &nbsp;

- *skipTransform*: `boolean|String[]` *experimental feature*
  Array of glob patterns to verify whether the module transformation should be skipped for the modules which are matching the glob pattern. If the value is a `boolean` then the transformation can be skipped in general by setting the value to `true`. The configuration can be incorporated from the `customConfiguration` of a dependency using that middleware, e.g. a library can provide its `customConfiguration` for the application project like this (and can reuse the configuration internally via [YAML anchors](https://yaml.org/spec/1.2.2/#692-node-anchors)):
  ```yaml
  specVersion: "3.0"
  metadata:
    name: com.myorg.mylib
  type: library
  customConfiguration:
    ui5-tooling-modules: &cfgModules
      skipTransform:
        - "@luigi-project/container/dist/anypath/**"
  builder:
    customTasks:
      - name: ui5-tooling-modules-task
        afterTask: replaceVersion
        configuration:
          <<: *cfgModules
  ```
  &nbsp;

- *inject*: `Map<String, String|String[]>` *experimental feature*
  A map of Globals which are injected as imports to an NPM package to handle cases in which functions need to be poly- or ponyfilled. The configuration is aligned with definition of the Globals in the [@rollup/plugin-inject](https://www.npmjs.com/package/@rollup/plugin-inject):
  ```yaml
  configuration:
    inject:
      # import setImmediate from 'set-immediate-shim'
      setImmediate: set-immediate-shim
      # import { Promise } from 'es6-promise'
      Promise:
        - es6-promise
        - Promise
      # import { Promise as P } from 'es6-promise'
      P: 
        - es6-promise
        - Promise
      # import $ from 'jquery'
      $: jquery
      # import * as fs from 'fs'
      fs: 
        - 'fs'
        - '*'
  ```
  &nbsp;

- *legacyDependencyResolution*: `boolean`
  Re-enables the legacy dependency resolution of the tooling extension which allows to use entry points from `devDependencies` of the project. By default, only the `dependencies` maintained in the projects' `package.json` and the transitive dependencies are considered for the entry points and all other entry points are ignored. (available since new minor version `3.7.0` which introduces a new dependency resolution for `dependencies` only)
  &nbsp;

- *additionalDependencies*: `string[]`
  List of additional dependency names to include into the bundling. By default all dependencies and their transitive dependencies are considered. In some cases it is useful to also include devDependencies, e.g. when re-packaging a thirdparty package. If you want to exclude this dependency from being a transitive dependency then you can put it into the devDependencies and list it in this configuration option (but keep in mind that this may exclude the dependency from some check tools!)
  &nbsp;

- *minify*: `boolean` *experimental feature*
  Flag to indicate that the generated code should be minified (in case of excluding thirdparty resources from minification in general, this option can be used to minify just the generated code)
  &nbsp;

- *sourcemap*: `boolean` *experimental feature*
  Flag to indicate that the sourcemap generation should be enabled. By default the option is diabled. Possible values are `true`, `false`, `"inline"`, and `hidden`.
  &nbsp;

The following configuration options are relevant for the `task` and the `middleware` which allow you to directly configure rollup plugins which is used as follows:

```yaml
  configuration:
    pluginOptions:   # map of plugin options
      webcomponents: # the name of the rollup plugin
        skip: true   # configuration
```

The available plugin configuration options are:

- *pluginOptions.webcomponents.skip*: `boolean`
  Flag to skip the transformation of Web Components to UI5 Controls a.k.a. *Seamless Web Components* support. This allows to directly require the Web Components modules from NPM packages and use them as UI5 Controls. The NPM packages providing Web Components must include a [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) declared in the `customElements` field in the `package.json`. (defaults to `false`)
  &nbsp;

- *pluginOptions.webcomponents.force*: `boolean`
  Flag to force the transformation of Web Components to UI5 Controls a.k.a. *Seamless Web Components* support. In some cases, in which the framework version cannot be part of the `ui5.yaml`, you can force the transformation. (defaults to `true`)
  &nbsp;

- *pluginOptions.webcomponents.scoping*: `boolean`
  Flag to disable the [Custom Elements Scoping](https://sap.github.io/ui5-webcomponents/docs/advanced/scoping/) of UI5 Web Components. This allows to load multiple versions of UI5 Web Components into a single application without conflicts. This feature is enabled by default and can be disabled if needed. (defaults to `true`)
  &nbsp;

- *pluginOptions.webcomponents.enrichBusyIndicator*: `boolean` *experimental flag*
  Flag to include the BusyIndicator support from into the generated Web Components package module. (defaults to `false`)
  &nbsp;

- *pluginOptions.webcomponents.includeAssets*: `boolean` *experimental flag*
  Flag to include all assets into the thirdparty folder: such as all themes and languages. Although they will be lazily loaded the generation process will slow down and you will have many additional files. All dynamic imports will reside inside the `_dynamics` folder within the thirdparty folder. (defaults to `false`)
  &nbsp;

The following configuration options are just relevant for the `task`:

- *prependPathMappings*: `boolean`  
  Prepends the path mappings for the UI5 loader to the `Component.js` which allows to run the Component using 3rd party modules in e.g. Fiori launchpad environments (defaults to `false`)
  &nbsp;

- *addToNamespace*: `boolean|string`
  Puts 3rd party modules into the namespace of the Component to make them Component-local. All used 3rd party modules will be moved by default into the sub-namespace `thirdparty` of the Component namespace at build time. If you use a string as value of `addToNamespace` you can define a custom namespace, e.g. `my/namespace/for/libs` which will be nested in the Components' namespace. With that option you can run your application using 3rd party modules in a Fiori launchpad environment. In some cases (wrong dependency rewrite, wish to keep 3rd party modules in the `resources` path, ...) it might be necessary to disable this option. (defaults to `true`, disables *prependPathMappings* when set to `true`)
  &nbsp;
  > :warning: While this works great for any non-UI5 3rd party module, there are limitations for the consumption of UI5 modules from custom control 3rd party modules (NPM packages). The UI5 module names (used for `Object.extend(...)`, aggregation types, ...) are not rewritten and this may cause issues. UI5 assumes that the used module path (slash syntax) is matching the module name (dot syntax). This can lead to issues for `Object.isA(...)` checks, Renderer lookups (when not inlined or referenced by module), or for any other API which derives the module name from the module path or vice versa. If you encounter such issues you may consider to disable the option and instruct the loader via `sap.ui.loader.config({ paths: ... })` to load the resources properly.

- *removeScopePrefix*: `boolean`
  Removes the scope prefix `@` from the namespace/path of the 3rd party module when adding it to the namespace with the *addToNamespace* option.
  &nbsp;

- *providedDependencies*: `String[]`
  An array of NPM package names which will be available in the development server via the middleware but will be ignored for the build process via the task. Provided dependencies are considered as being provided by the application runtime rather than it must be shipped with the current project. Provided dependencies will ignore any of the configurations above.
  &nbsp;

- *includeAssets*: `Map<String, String[]>` *experimental feature*
  A map of NPM package names to list of glob patterns which defines the assets to be included. The list of glob patterns can be omitted in case of copying all resources of the NPM package.
  &nbsp;

The following configuration options are just relevant for the `middleware`:

- *watch*: `boolean|String[]` *experimental flag*
  For development scenarios, the server is listening to changes of the source files of the project and its dependencies and triggers the generation of the bundle if the used NPM packages have been changed (defaults to `true`) - additionally, you can pass a list of folders or files to watch for changes for special cases
  &nbsp;

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-tooling-modules": "*"
    // ...
}
```

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

> :warning: In case your application is using a proxy such `fiori-tools-proxy`, the proxy must run after `ui5-tooling-modules-middleware` middleware. Otherwise proxy will try to serve the resources for your installed npm package instead of `ui5-tooling-modules-middleware`. You can achieve this by setting `afterMiddleware: ui5-tooling-modules-middleware` in `fiori-tools-proxy` middleware.

---
:fire: **TIP** :fire:

[YAML anchors](https://yaml.org/spec/1.2.2/#692-node-anchors) are a great feature to avoid redundancies in `.yaml` files. You can share the configuration of the `task` and the `middleware` in the following way:

**`ui5.yaml`**
```yaml
customConfiguration:
  ui5-tooling-modules: &cfgModules
    debug: true
    keepDynamicImports:
      - "@luigi-project/container"
[...]
server:
  customMiddleware:
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
      configuration:
        <<: *cfgModules
[...]
builder:
  customTasks:
    - name: ui5-tooling-modules-task
      afterTask: replaceVersion
      configuration:
        <<: *cfgModules
        addToNamespace: true
```

With this approach you can ensure that you have a consistent configuration across your `task` and `middleware`.

---

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
