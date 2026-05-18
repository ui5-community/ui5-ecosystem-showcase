# UI5 middleware to enable websockets

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

Middleware for [ui5-server](https://github.com/SAP/ui5-server) to demo WebSocket usage with an simple echo service.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

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

This work is licensed under [Apache 2.0](../../LICENSE).

Built with care (and a lot of caffeine). If this helped you build, test, or ship, the next coffee — or drink — is on you when you bump into a contributor.
