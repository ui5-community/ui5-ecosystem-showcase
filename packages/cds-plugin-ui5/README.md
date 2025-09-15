# cds-plugin-ui5

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `cds-plugin-ui5` is a CDS server `cds-plugin` for the node runtime of the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/about/) which enables the integration of UI5 CLI based (UI5 freestyle or Fiori elements) projects into the CDS server via the UI5 CLI express middlewares. The UI5 or Fiori elements projects just need to be located in the `app` folder of the CDS server, or via the `cds.env.folders.app` variable, or be a dependency of the CDS server.

> :construction: **Note**
> This cds-plugin is still work in progress and not final yet!

## Prerequisites

The plugin requires [`@sap/cds`](https://www.npmjs.com/package/@sap/cds) `>=6.8.2`.

## Usage

Add a `devDependency` to the `cds-plugin-ui5` to your CDS server project:

```sh
npm add cds-plugin-ui5 -D
```

That's it!

### Configuration

The plugin accepts configuration to control the mount path for the embedding into the CDS server and selected configuration options for the UI5 server middlewares which are embedded into the mount path of the CDS server.

#### Mount Path

The mount path of the UI5 application configures the nested Router for the UI5 server middlewares to run under this predefined path. It is by default derived from the `metadata/name` of the `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
```

This configuration can be overruled by adding a the `customConfiguration/cds-plugin-ui5/mountPath` option into the `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
customConfiguration:
  cds-plugin-ui5:
    mountPath: /bookshop
```

In some cases it is necessary to overrule the UI5 application local configuration in the CDS server. Therefore, you can add custom configuration into the `package.json` of the CDS server into the section: `cds/cds-plugin-ui5/modules/%moduleId%/mountPath`

```json
{
  "name": "cds-bookshop",
  [...]
  "cds": {
    [...]
    "cds-plugin-ui5": {
      "modules": {
        "ui5-bookshop": {
          "mountPath": "/the-bookshop"
        }
      }
    }
  }
}
```

The `moduleId` is either the directory name for local apps in the `app` directory of the CDS server or for dependencies the `name` from the `package.json`.

The configuration can also be injected with the environment variable `CDS_PLUGIN_UI5_MODULES`. It contains the JSON string from the configuration above, e.g.:

```sh
CDS_PLUGIN_UI5_MODULES="{ \"ui5-bookshop\": { \"mountPath\": \"/the-bookshop\" } }" cds-serve
```

#### Lazy Loading

The plugin supports lazy loading of UI5 applications which means that the UI5 middlewares will not be applied by default. The first time a UI5 application will be accessed in the CDS server triggers the load and apply of the UI5 middlewares. This feature is not active by default and needs to be activated with the environment variable `CDS_PLUGIN_UI5_LAZY_LOADING`.

```sh
# enable lazy loading for UI5 applications
CDS_PLUGIN_UI5_LAZY_LOADING=true cds watch
```

#### Logger

The `cds-plugin-ui5` uses the logger from CDS. By default, it adds coloring to the logs from CDS. This can be disabled in general by using the environment variable `NO_COLOR` for the logger overall or specifically for the `cds-plugin-ui5` by setting the environment variable `CDS_PLUGIN_UI5_NO_CUSTOM_LOGGER`.

```sh
# disable the colored logging extension of the cds-plugin-ui5
CDS_PLUGIN_UI5_NO_CUSTOM_LOGGER=1 cds watch
```

#### UI5 Server Middlewares

If you require to configure the UI5 server middlewares, you can do so by adding some selected configuration options in the `package.json` of the CDS server in the section: `cds/cds-plugin-ui5/modules/%moduleId%`

```json
{
  "name": "cds-bookshop",
  [...]
  "cds": {
    [...]
    "cds-plugin-ui5": {
      "modules": {
        "ui5-bookshop": {
          "configFile": "ui5.yaml",
          "workspaceConfigFile": "ui5-workspace.yaml",
          "workspaceName": "default",
          "versionOverride": "1.117.0"
        }
      }
    }
  }
}
```

The `moduleId` is either the directory name for local apps in the `app` directory of the CDS server or for dependencies the `name` from the `package.json`.

The available configuration options are:

* `configFile`: *`string`* - name of the config file (defaults to "ui5.yaml")
* `workspaceConfigFile`: *`string`* - name of the workspace config file (defaults to "ui5-workspace.yaml")
* `workspaceName`: *`string`* - name of the workspace (defaults to "default" when the file at workspaceConfigPath exists)
* `versionOverride`: *`string`* - Framework version to use instead of the one defined in the root project

If the `configFile` or `workspaceConfigFile` startes with `./` or `../` then the config file is considered to be relative to the `package.json`.

The configuration can also be injected with the environment variable `CDS_PLUGIN_UI5_MODULES`. It contains the JSON string from the configuration above, e.g.:

```sh
CDS_PLUGIN_UI5_MODULES="{ \"ui5-bookshop\": { \"configFile\": \"ui5-dist.yaml\" } }" cds-serve
```

The configuration options from the UI5 server middlewares and the mount path can be mixed together as they both are in the same section of the `package.json`.

## Info for UI5 CLI Extension Developers

Custom middlewares may generate virtual app pages which should also be listed as web applications in the welcome page of the `@sap/cds` server. This is possible by assigning a static `getAppPages` function to the middleware function. The following snippet show-cases how this can be done:

```js
// the middleware factory function
module.exports = async ({ log, resources, options }) => {
  // create the middleware function
  const mwFn = (req, res, next) => {
    [...]
  };

  /**
   * Returns an array of app pages to be added to the welcome
   * page of the <code>@sap/cds</code> server.
   * @returns {undefined|string[]} array of app pages
   */
  mwFn.getAppPages = function() {
    return ["/test.html"];
  };

  // finally return the middleware function
  return mwFn;
};
```

The returned app pages will be added to the welcome page within the respective mount path.

> :warning: The app pages cannot be retrieved and injected when using the lazy loading option.

## Hints

This section includes hints for the usage of the `cds-plugin-ui5` with other tools.

### JEST

The `cds-plugin-ui5` doesn't work with JEST out of the box as it internally is using dynamic imports to load helpers from the UI5 CLI. JEST fails with a `segmentation fault` error and therefore, the `cds-plugin-ui5` is disabled when running in context of JEST. It can be forcefully enabled by setting the environment variable `CDS_PLUGIN_UI5_ACTIVE=true`. But in this case you need to at least use Node.js 21 (https://github.com/nodejs/node/issues/35889) and you need to enable the experimental support for ES modules (https://jestjs.io/docs/ecmascript-modules). This enables the `cds-plugin-ui5` to run in context of JEST.

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
