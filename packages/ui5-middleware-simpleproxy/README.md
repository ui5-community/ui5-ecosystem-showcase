# UI5 simple proxy middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

## Install

```bash
npm install ui5-middleware-simpleproxy --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- baseUri: `string`
  The baseUri to proxy. Can also be set using the `UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI` environment variable.
- strictSSL: `boolean`
  Ignore strict SSL checks. Default value `true`. Can also be set using the `UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL` environment variable.
- limit: `string`
  This sets the body size limit (default: `1mb`). If the body size is larger than the specified (or default) limit,
  a `413 Request Entity Too Large`  error will be returned. See [bytes.js](https://www.npmjs.com/package/bytes) for
  a list of supported formats.

In general, use of environment variables or values set in a `.env` file will override configuration values in the `ui5.yaml`.

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

## How to ignore self-signed certificates?

In case you are using HTTPS and self-signed certificates, you may see an error as displayed below:

```bash
Error: unable to verify the first certificate
    at TLSSocket.onConnectSecure (_tls_wrap.js:1321:34)
    at TLSSocket.emit (events.js:210:5)
    at TLSSocket._finishInit (_tls_wrap.js:794:8)
    at TLSWrap.ssl.onhandshakedone (_tls_wrap.js:608:12)
```

To avoid it, you can set the `strictSSL` value in proxy request to be `false`. Its default value is `true`.

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-simpleproxy
    afterMiddleware: compression
    mountPath: /odata
    configuration:
      baseUri: "http://services.odata.org"
      strictSSL: false
```

## .env support

This plugin supports use of a `.env` file to declare environment variable values for configuration as described above. The file should be put in the same directory where you run `ui5 build`, `ui5 serve`, etc. The file might have contents like:

```shell
UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=https://host.tld:1234/sap
UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL=false
```

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
