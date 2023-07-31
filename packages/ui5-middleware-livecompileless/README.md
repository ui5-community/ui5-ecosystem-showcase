# UI5 middleware for live compiling less files

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), live compiling less files.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3.x.x` only support UI5 Tooling V3. Any previous release below version `3` (if available) also supports older versions of the UI5 Tooling. But it's strongly recommended to upgrade to UI5 Tooling V3!

## Install

```bash
npm install ui5-middleware-livecompileless --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`  
  verbose logging

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-livecompileless": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customMiddleware:
    - name: ui5-middleware-livecompileless
      beforeMiddleware: serveResources
      configuration:
        debug: true
```

## How it works

The css file corresponding to your less file needs to be maintained in the manifest as described [here](https://sapui5.hana.ondemand.com/#/topic/723f4b2334e344c08269159797f6f796).
The middleware will watch for those css files and searches for the corresponding less file, compiles it and serves it back.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@sebbi](https://app.slack.com/client/T0A7MQSJ1/D01TDU3RMSQ/user_profile/UBV5L8N8M) a beer or buy [@marcel_schork](https://twitter.com/marcel_schork) a coke when you see them.
