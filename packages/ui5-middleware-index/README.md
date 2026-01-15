# UI5 middleware for delivering a welcome/start/'index' page to the client

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), delivering the `$index.html` of choice (instead of the directory listing).

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-middleware-index --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `<boolean>`, default: `false`
- welcomeFile: `<string>`, default: `index.html`
  the file to redirect to when the root path `/` is requested
- index: `<string>`, default: `index.html`  *deprecated*
  file inside `$yourapp` to deliver for `http://<host>:<port>/`

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
      welcomeFile: "index_peter.html"
```

## How it works

The middleware delivers the configured `index` HTML-file to the client if the FQDN + trailing slash `/` is requested in the browser.

## Development

If you want to contribute to `ui5-middleware-index`, please use [`Prettier`](https://prettier.io) for code formatting/style and apply the rules from `./.prettierrc`. Thanks 🙏!

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu), [@stefanbeck3](https://twitter.com/stefanbeck3), [github.com/margopolo](https://github.com/margopolo) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
