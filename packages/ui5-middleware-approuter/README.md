# UI5 middleware using `@sap/approuter` for service connectivity

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), making `destinations` configured in SAP Cloud Foundry or SAP XS Advanced available for local development using the [`http-proxy-middleware`](https://www.npmjs.com/package/http-proxy-middleware).

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-middleware-approuter --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `debug`: `<boolean>`, default: `false`  
verbose logging
- `port`: `<int>`, default: `5000`  
port to run the underlying `approuter` on

- `xsappJson`: `<string>`, default: `"./xs-app.json"`  
path to the cf-style approuter configuration file `xs-app.json`
:information_source: the regex for the destination routes must match the pattern : `/[^/]*\/(.*\/)?[^/]*/`, e.g. `"^/backend/(.*)$"` or `"^/index.html"`

- `destinations`: `<string[]>`, default: `[]`
  - `name: <string>` destination name, matching the one used in routes in `xs-app.json`  
  - `url: <string>` URI to the host to "proxy" to  
  
  alternatively the destinations can also be defined in a `.env` file. They need to be in encoded in a single JSON string  
  e.g.

  ```properties
  xsapp_dest = [{"name": "destination-name", "url": "<some-service-url>"}]
  ```

  To use these destinations they need to passed to the `destinations` option as a string `"$env:<key-in-env-file>"` (e.g. `destinations: "$env:xsapp_dest"`)

- `allowServices`: `<boolean>`, default: `false`  
allow [BTP services](https://discovery-center.cloud.sap/serviceCatalog?) to be used at runtime that are configured in `xs-app.json`  
(requires an authenticated BTP session!)

- `authenticationMethod`: `"none"` || `"route"`, default: `"none"`  
whether to equip routes with authentication

- `allowLocalDir`: `<boolean>`, default: `false`  
allow static assets to be picked up by the included `approuter`; defaults to `false` as usually all local files/assets are supposedly served by `ui5-server`

- `rewriteContent`: `<boolean>`, default: `true`  
enables/disables rewriting of the content by replacing the proxied url in the response body with the server url

- `rewriteContentTypes`: `<string[]>`, default: `["text/html", "application/json", "application/atom+xml", "application/xml"]`  
defines the content types which are included for rewriting the content by enabling the `rewriteContent` option

- `extensions`: `<string[]>`, default: `[]` - a list of extensions to be required and injected into the local approuter instance
  - `module: <string>` - local module path (must start with `./`): `"./my-local-extension.js"` or a module from an npm package: `"@my-scope/my-package/my-extension.js"`
  - `parameters: <Map<string, string>>`, optional - a map of parameters given as key value pairs which will be injected into the handler function of the extension as the last (4th) argument (`function(req, res, next, params)`, remark: handler functions with more than 3 arguments will not be called for regular extensions only for these extensions!)

- `disableWelcomeFile`: `<boolean>`, default: `false` *experimental*
disables the welcome file handling of the approuter based on the `welcomeFile` property in the `xsappJson` file

- `appendAuthRoute`: `<boolean>`, default: `false` *experimental*
if `true` the middleware adds a custom route for all HTML pages to trigger authentication:

  ```json
  {
    "source": "^/([^.]+\\.html?(?:\\?.*)?)$",
    "localDir": relativeSourcePath,
    "target": "$1",
    "cacheControl": "no-store",
    "authenticationType": "xsuaa"
  }
  ```

- `enableWebSocket`: `<boolean>`, default: `false` *experimental*
enables support for proxying web sockets, will be also automatically detected from `xs-app.json`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-approuter": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-approuter
      afterMiddleware: compression
      configuration:
        authenticationMethod: "none" # "none" || "route", default: "none"
        allowServices: true # allows BTP services like SAP IoT to be used 
        debug: true
        port: 1091
        xsappJson: "xs-app.json"
        destinations:
          # check that the destination name (here: "backend") matches your router in xs-app.json
          - name: "backend"
            url: "https://services.odata.org/V4/(S(fdng4tbvlxgzpdtpfap2rqss))/TripPinServiceRW/"
```

3. put the cf routing config file `xs-app.json` in the location of `$yourapp` you specified above (`xsappJson`) -  
recommendation is to put it at the root `/` of your UI5 app!

## How it works

The middleware wraps the `@sap/approuter` npm module that is used in the SAP BTP CloudFoundry environment for serving UI5 applications, including proxying the configured destinations.

During development, the `approuter` is started on a configurable port, running alongside the regular local `ui5-server`. When a call to a URL destination is detected at `$webserver/destination`, it is proxied to `$approuter:$port` via [`request`](https://www.npmjs.com/package/request).

### Using `approuter` extensions

The `ui5-middleware-approuter` allows using `approuter` extensions. It is possible to pass parameters to handler functions of the extensions as a 4th argument of the handler function.

The configuration of the extensions in the `ui5.yaml` looks like that:

```yaml
    - name: ui5-middleware-approuter
      afterMiddleware: compression
      configuration:
        extensions:
          - module: ./approuter-local-ext.js
            parameters:
              userId: mustermann@ui5.com
```

And in the `approuter-local-ext.js` you can consume the parameters like that:

```js
module.exports = {
    insertMiddleware: {
        beforeRequestHandler: [
            {
                path: '/',
                handler: function forwardUserInfo(req, res, next, params) {
                    res.setHeader('x-user-id', params?.userId || "unknown@ui5.com")
                    next()
                }
            }
        ]
    }
}
```

Keep in mind that the 4th parameter doesn't work for the regular `approuter` extensions and the handler function will not be called when having more than 3 arguments.

## Misc/FAQ

**q**: does authentication on destinations  
**a**: yes, works 🥳

- prerequisite: a `default-env.json` file at the root `/` of your UI5 app
Bespoken `default-env.json` file can be obtained [via the `Default Env CLI Plugin`](https://github.com/saphanaacademy/DefaultEnv)
- `ui5.yaml > server > customMiddlware > ui5-middleware-approuter`: set `authenticationMethod` to `route` (see config example above)
- `xs-app.json` (also at the root `/` of your UI5 app):
  - set `authenticationMethod` to `route`
  - in the route with the desired protected authentication, set `authenticationType` to `xsuaa`  

see `./test/auth/**/*` for example files for the above!

**q**: what's `allowLocalDir` for?  
**a**: allows to protect local static assets (e.g. `html` files) -in addition to destinations- with approuter as well.  
see `test/auth/xs-app-with-localDir.json` for an example!

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
