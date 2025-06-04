# UI5 simple proxy middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-middleware-simpleproxy --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `baseUri`: `string`
  The baseUri to proxy. Can also be set using the `UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI` environment variable. To proxy WebSockets just use a WebSocket URL, e.g. `ws://echo.websocket.org`. *Hint: the `mountPath` of the middleware is not considered for the baseUri. It's just used as is!*
- `strictSSL`: `boolean`
  Ignore strict SSL checks. Default value `true`. Can also be set using the `UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL` environment variable.
- `removeETag`:  `boolean`
  Removes the ETag header from the response to avoid conditional requests.
- `username`:  `string`
  Username used for Basic Authentication.
- `password`:  `string`
  Password used for Basic Authentication.
- `httpHeaders`: `map`
  Http headers set for the proxied request. Will overwrite the http headers from the request. 
- `query`: `map`
  Query parameters set for the proxied request. Will overwrite the parameters from the request. 
- `excludePatterns`: `string[]`
  Array of exclude patterns using glob syntax
- `skipCache`: `boolean`
  Remove the cache guid when serving from the FLP launchpad if it matches an excludePattern
- `enableWebSocket`: `<boolean>`, default: `false` *experimental*
enables support for proxying web sockets

In general, use of environment variables or values set in a `.env` file will override configuration values in the `ui5.yaml`.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-simpleproxy": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-simpleproxy
    afterMiddleware: compression
    mountPath: /odata
    configuration:
      baseUri: "https://services.odata.org"
      username: myUsername
      password: myPassword
      httpHeaders:
        Any-Header: AnyHeader
      query:
        sap-client: '206'
      excludePatterns:
      - "/local/**"
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
UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME=myUsername
UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD=myPassword
```

## Hints

If you are using the Microsoft OData services for testing purposes, like [Northwind](https://services.odata.org/v2/northwind/northwind.svc/) for V2 or [TripPin](https://www.odata.org/blog/trippin-new-odata-v4-sample-service/) for V4, please ensure to use the `https` URLs instead of the `http` URLs. The `http` URL will redirect to `https` but instead of the proxy it will try to directly connect to the Microsoft OData services.

Another known issue is the the validation of the `csrf-token` fails for the `$batch` requests (e.g. in Chrome). To workaround this issue, also running the dev server in `https` can solve the issue.

UI5 Tooling supports running the dev server in `https` by running the following command line option:

```sh
ui5 serve --h2
```

**Note:** With Node v24, usage of HTTP/2 is no longer supported in UI5 Tooling. Please check https://github.com/SAP/ui5-tooling/issues/327 for updates.

More details can be found in the documentation of the UI5 tooling for the [`ui5 serve` command](https://sap.github.io/ui5-tooling/stable/pages/CLI/#ui5-serve).

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
