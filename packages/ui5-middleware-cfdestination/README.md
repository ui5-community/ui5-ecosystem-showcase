# UI5 middleware for CF destinations

Middleware for [ui5-server](https://github.com/SAP/ui5-server), making `destinations` configured in SAP CF available for local development.

## Install

```bash
npm install ui5-middleware-cfdestination --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `debug`: `<boolean>`, default: `false`  
verbose logging

- `port`: `<int>`, default: `5000`  
port to run the underlying `approuter` on

- `xsappJson`: `<string path>`  , default: `.xs-app.json`
path to the cf-style approuter configuration file `xs-app.json`

- `destinations`: `<Array of name/value pairs>`  
  - `name: <string>` destination name, matching the one used in routes in `xs-app.json`  
  - `url: <string>` URI to the host to "proxy" to

- `allowServices`: `<bool>`, default: `false`  
allow [BTP services](https://discovery-center.cloud.sap/serviceCatalog?) to be used at runtime that are configured in `xs-app.json`  
(requires an authenticated BTP session!)

- `authenticationMethod`: `"none"` || `"route"`, default: `"none"`  
whether to equip routes with authentication

- `allowLocalDir`: `<bool>`, default: `false`  
allow static assets to be picked up by the included `approuter`  
defaults to `false` as usually all local files/assets are supposedly served by `ui5-server`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-cfdestination": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-cfdestination",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
