# UI5 serve static middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling to serve static resources.

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
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-servestatic",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
      rootPath: SAPUI5_SDK_1_60__RESOURCES
      pathIsEnvVar: true
```
## How it works

The middleware integrates [serve-static](https://github.com/expressjs/serve-static) to serve static resources from a specified `rootPath`.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
