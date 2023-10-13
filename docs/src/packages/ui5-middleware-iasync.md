# UI5 middleware for syncing interactions across browsers

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), syncing interactions between different browsers, hopefully somewhat easing manual testing :)  

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-middleware-iasync --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `https: <boolean>` default: false  
whether to use the middleware via SSL/wss
- `httpModule: <string>`, default: undefined  
capability to e.g. use `http2`
- `port: <integer>`, default: 3000  
port to run middleware at
- `debug: <boolean>`, default: false  
display extensive logging
- `logConnections: <boolean>`, default: true  
show connected browsers

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-iasync": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-iasync
    beforeMiddleware: serveResources
    configuration:
      https: false
      debug: false
      logConnections: true
      port: 4711
```

## How it works

`iasync` uses [browsersync.io](https://www.browsersync.io) under the hood. It transmits user interactions of the UI via a websocket pool. Respectively, all browsers connected to `http://ui5-app:port` open a websocket connection, listening for and receiving interactions events.  

Additionally, `iasync` injects custom HTML into `index.html`, manipulating browser event handlers of UI5 controls - see `lib/ui5mangler.html`. E.g. the `sap.m.Button`'s click event is overwritten with its' tap event.

## Misc/FAQ

> Watch Out!  
> Due to manipulation of the UI5 controls (see above), interactions of the UI might lead to unexpected results!


## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
