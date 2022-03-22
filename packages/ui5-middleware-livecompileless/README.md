# UI5 middleware for live compiling less files

Middleware for [ui5-server](https://github.com/SAP/ui5-server), live compiling less files.

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
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-livecompileless",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
