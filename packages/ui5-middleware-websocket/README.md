# UI5 middleware to enable websockets

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server) to demo WebSocket usage with an simple echo service.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-middleware-websocket --save-dev
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-websocket-echo": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-websocket-echo
    afterMiddleware: compression
    mountPath: /wsecho
```

## How it works

The middleware uses the utility function `websocket` which allows to inject a WebSocket middleware function into a UI5 middleware function:

```js
const websocket = require("ui5-middleware-websocket/lib/websocket");

/**
 * WebSocket middleware to act as an echo service.
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @returns {Function} Middleware function to use
 */
module.exports = ({ log }) => {
  return websocket(function echo(ws, req /*, next */) {
    ws.on("message", function (message) {
      log.info(`message: ${message}`);
      ws.send(`echo ${message}`);
    });
    log.info(`Connection established with ${req.url}`);
  });
};
```

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see him.
