# cds-plugin-ui5

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `cds-plugin-ui5` is a CAP server `cds-plugin` which enables the integration of UI5 tooling based (UI5 freestyle or Fiori elements) projects into the CAP server via the UI5 tooling express middlewares. The UI5 or Fiori elements projects just need to be located in the `app` folder of the CAP server or be dependency of the CAP server.

> :construction: **Note**
> This cds-plugin is still work in progress and not final yet!

## Prerequisites

The plugin requires [`@sap/cds`](https://www.npmjs.com/package/@sap/cds) `>=6.8.2`.

## Usage

Add a `devDependency` to the `cds-plugin-ui5` to your CAP server project:

```sh
npm add cds-plugin-ui5 -D
```

That's it!

### Configuration

The plugin accepts configuration to control the mount path for the embedding into the CAP server and selected configuration options for the UI5 server middlewares which are embedded into the mount path of the CAP server.

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

In some cases it is necessary to overrule the UI5 application local configuration in the CAP server. Therefore, you can add custom configuration into the `package.json` of the CAP server into the section: `cds/cds-plugin-ui5/modules/%moduleId%/mountPath`

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

The `moduleId` is either the directory name for local apps in the `app` directory of the CAP server or for dependencies the `name` from the `package.json`.

The configuration can also be injected with the environment variable `CDS_PLUGIN_UI5_MODULES`. It contains the JSON string from the configuration above, e.g.:

```sh
CDS_PLUGIN_UI5_MODULES="{ \"ui5-bookshop\": { \"mountPath\": \"/the-bookshop\" } }" cds-serve
```

#### UI5 Server Middlewares

If you require to configure the UI5 server middlewares, you can do so by adding some selected configuration options in the `package.json` of the CAP server in the section: `cds/cds-plugin-ui5/modules/%moduleId%`

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

The `moduleId` is either the directory name for local apps in the `app` directory of the CAP server or for dependencies the `name` from the `package.json`.

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

## Info for UI5 Tooling Extension Developers

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

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
