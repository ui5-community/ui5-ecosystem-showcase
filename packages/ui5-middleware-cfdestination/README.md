# UI5 middleware for CF destinations

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), making `destinations` configured in SAP CF available for local development.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3.x.x` only support UI5 Tooling V3. Any previous release below version `3` (if available) also supports older versions of the UI5 Tooling. But it's strongly recommended to upgrade to UI5 Tooling V3!

## Install

```bash
npm install ui5-middleware-cfdestination --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `debug`: `<boolean>`, default: `false`  
verbose logging
- `port`: `<int>`, default: `5000`  
port to run the underlying `approuter` on

- `xsappJson`: `<string path>`, default: `"./xs-app.json"`  
path to the cf-style approuter configuration file `xs-app.json`
:information_source: the regex for the destination routes must match the pattern : `/[^/]*\/(.*\/)?[^/]*/`, e.g. `"^/backend/(.*)$"` or `"^/index.html"`

- `destinations`: `<Array of name/value pairs>`, default: `[]`
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
allow static assets to be picked up by the included `approuter`  
defaults to `false` as usually all local files/assets are supposedly served by `ui5-server`

- `rewriteContent`: `<boolean>`, default: `true`  
enables/disables rewriting of the content by replacing
the proxied url in the response body with the server url

- `rewriteContentTypes`: `<Array of strings>`, default: `["application/json", "application/atom+xml", "application/xml"]`  
defines the content types which are included for rewriting the content by enabling the `rewriteContent` option

- `limit`: `<string>`, default: `10mb`  
This sets the body size limit. If the body size is larger than the specified (or default) limit, a `413 Request Entity Too Large`  error will be returned. See [bytes.js](https://www.npmjs.com/package/bytes) for a list of supported formats

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-cfdestination": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-cfdestination
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

## Misc/FAQ

**q**: does authentication on destinations  
**a**: yes, works 🥳

- prerequisite: a `default-env.json` file at the root `/` of your UI5 app
Bespoken `default-env.json` file can be obtained [via the `Default Env CLI Plugin`](https://github.com/saphanaacademy/DefaultEnv)
- `ui5.yaml > server > customMiddlware > ui5-middleware-cfdestination`: set `authenticationMethod` to `route` (see config example above)
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
