# UI5 middleware for CF destinations

Middleware for [ui5-server](https://github.com/SAP/ui5-server), making `destinations` configured in SAP CF available for local development.

## Install

```bash
npm install ui5-middleware-cfdestination --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
verbose logging

- port: `<int>`  
port to run the underlying `approuter` at locally

- xsappJson: `<string path>`  
path to the cf configuration file `xs-app.json`

- destinations: `<Array of name/value pairs>`  
  - `name: <string>` destination name, matching the one used in routes in `xs-app.json`  
  - `url: <string>` URI to the host

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
        debug: true
        port: 1091
        xsappJson: "xs-app.json"
        destinations:
          # check that the destination name (here: "backend") matches your router in xs-app.json
          - name: "backend"
            url: "https://services.odata.org/V4/(S(fdng4tbvlxgzpdtpfap2rqss))/TripPinServiceRW/"
```

3. put the cf routing config file `xs-app.json` in the location of `$yourapp` you specified above (`xsappJson`)

## How it works

The middleware wraps the `@sap/approuter` npm module that is used in CF for serving UI5 applications, including proxying the configured destinations.

During development, the `approuter` is started on a configurable port, running alongside the regular local webserver. When a call to a URL destination is detectet at `$webserver/destination`, it is proxied to `$approuter:$port` via [`request`](https://www.npmjs.com/package/request).

## Misc/FAQ

Authentication on destinations is untested, but should work in theory (ha ha).

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
