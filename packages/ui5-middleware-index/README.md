# UI5 middleware for delivering a welcome/start/'index' page to the client

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), delivering the `$index.html` of choice (instead of the directory listing).

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3.x.x` only support UI5 Tooling V3. Any previous release below version `3` (if available) also supports older versions of the UI5 Tooling. But it's strongly recommended to upgrade to UI5 Tooling V3!

## Install

```bash
npm install ui5-middleware-index --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- index: `<string>`, default: `index.html`  
  file inside `$yourapp` to deliver for `http://<host>:<port>/`
- debug: `<boolean>`, default: `false`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-index": "*"
    // ...
}
```

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

The middleware delivers the configured `index` HTML-file to the client if the FQDN + trailing slash `/` is requested in the browser.

## Development

If you want to contribute to `ui5-middleware-index`, please use [`Prettier`](https://prettier.io) for code formatting/style and apply the rules from `./.prettierrc`. Thanks 🙏!


## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu), [@stefanbeck3](https://twitter.com/stefanbeck3), [github.com/margopolo](https://github.com/margopolo) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
