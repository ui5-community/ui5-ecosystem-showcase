# UI5 serve static middleware

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling to serve static resources.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-middleware-servestatic --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- rootPath: `string`
  the root path to the static resources on your system

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-servestatic": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:  

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-servestatic
    afterMiddleware: compression
    mountPath: /resources
    configuration:
      rootPath: "/Users/Me/upkg/sapui5-runtime-1.70/resources"
```

Example which uses Environment Variables from `.env` file

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-servestatic
    afterMiddleware: compression
    mountPath: /resources
    configuration:
      rootPath: ${env.SAPUI5_SDK_1_60__RESOURCES}
```

## How it works

The middleware integrates [serve-static](https://github.com/expressjs/serve-static) to serve static resources from a specified `rootPath`.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
