# UI5 middleware for syncing interactions across browsers

Middleware for [ui5-server](https://github.com/SAP/ui5-server), syncing interactions between different browsers, hopefully somewhat easing manual testing :)  

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
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-iasync",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
