# UI5 proxy middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

## Install

```bash
npm install ui5-middleware-proxy --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- uri: `string`
  the uri to proxy

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-proxy": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-proxy
    afterMiddleware: compression
    mountPath: /northwind
    configuration:
      uri: 'http://services.odata.org/V2/Northwind/Northwind.svc/'
```

## How it works

The middleware launches a simple `proxy`-server which proxies the requests to the given uri. Internally, it uses the express proxy middleware.

## License

[THE DERIVIED BEER-WARE LICENSE](../../LICENSE)

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
