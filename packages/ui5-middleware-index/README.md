# UI5 middleware for delivering a welcome/start/'index' page to the client

Middleware for [ui5-server](https://github.com/SAP/ui5-server), delivering the `$index.html` of choice (instead of the directory listing).

## Install

```bash
npm install ui5-middleware-index --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- index: `string`, default: `index.html`  
  file inside `$yourapp` to deliver for `http://<host>:<port>/`
- debug: `bool`, default: `false`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-index": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-index",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-index
    afterMiddleware: compression
    configuration:
      index: "index_peter.html"
```

## How it works

The middleware delivers the configiured `index` HTML-file to the client if the FQDN + trailing slash `/` is requested in the browser.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu), [@stefanbeck3](https://twitter.com/stefanbeck3), [github.com/margopolo](https://github.com/margopolo) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
