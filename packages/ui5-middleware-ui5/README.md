# UI5 middleware to include UI5 application dependencies

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), to include and serve UI5 application dependencies in the same server instance.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-middleware-ui5 --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

The plugin accepts configuration to control the mount path and selected configuration options for the UI5 server middlewares which are embedded into the current UI5 server via an express router.

- debug: `boolean`  
  enable detailed logging

- serveFromNamespace: `boolean` (defaults to `true`)
  serves the UI5 application from the `/resources/%namespace%` so that the UI5 application can be resolved without any additional `resourceroots` mapping; when disabled (setting option to `false`) the UI5 application will be served from it's `mountPath` (typically the UI5 app `name` or as fallback the `moduleId`); a custom `mountPath` configuration (see below) disables this configuration option!

- modules: `Object`
  modules configuration (key = moduleId, values = object) - details in the following sections about the module configuration

### Module Configuration: Mount Path

The mount path of the UI5 application configures the nested Router for the UI5 server middlewares to run under this predefined path. It is by default derived from the `metadata/name` of the `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
```

This configuration can be overruled by adding a the `customConfiguration/ui5-middleware-ui5/mountPath` option into the `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
customConfiguration:
  ui5-middleware-ui5:
    mountPath: /bookshop
```

In some cases it is necessary to overrule the UI5 application local configuration. Therefore, you can use the configuration of the middleware in your `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
server:
  customMiddleware:
    - name: ui5-middleware-ui5
      afterMiddleware: compression
      configuration:
        modules:
          %moduleId%:
            mountPath: "/app"
```

The `moduleId` is the `name` from the `package.json`.

### Module Configuration: UI5 Server Middleware

If you require to configure the UI5 server middlewares, you can do so by adding some selected configuration options in the configuration of the middleware in your `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5.bookshop
type: application
server:
  customMiddleware:
    - name: ui5-middleware-ui5
      afterMiddleware: compression
      configuration:
        modules:
          %moduleId%:
            configFile: "ui5.yaml",
            workspaceConfigFile: "ui5-workspace.yaml",
            workspaceName: "default",
            versionOverride: "1.117.0"
```

The `moduleId` is the `name` from the `package.json`.

The available configuration options are:

- `configFile`: *`string`* - name of the config file (defaults to "ui5.yaml")
- `workspaceConfigFile`: *`string`* - name of the workspace config file (defaults to "ui5-workspace.yaml")
- `workspaceName`: *`string`* - name of the workspace (defaults to "default" when the file at workspaceConfigPath exists)
- `versionOverride`: *`string`* - Framework version to use instead of the one defined in the root project

If the `configFile` or `workspaceConfigFile` startes with `./` or `../` then the config file is considered to be relative to the `ui5.yaml`.

The configuration options from the UI5 server middlewares and the mount path can be mixed together as they both are in the same section of the `ui5.yaml`.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-ui5": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-ui5
    afterMiddleware: compression
```

## How it works

The middleware searches for UI5 application projects in the project dependencies and includes them via express routers into the current UI5 development server. The projects will be served via their namespace (from `ui5.yaml`) or the package name (from `package.json`).

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
