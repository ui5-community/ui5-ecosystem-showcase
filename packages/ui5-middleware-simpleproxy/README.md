# UI5 simple proxy middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

## Install

```bash
npm install ui5-middleware-simpleproxy --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- baseUri: `string`
  the baseUri to proxy

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-simpleproxy": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-simpleproxy",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-simpleproxy
    afterMiddleware: compression
    mountPath: /odata
    configuration:
      baseUri: "http://services.odata.org"
```

## How it works

The middleware launches a simple `proxy`-server which proxies the requests to the given uri. Internally, it uses the express proxy middleware.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
