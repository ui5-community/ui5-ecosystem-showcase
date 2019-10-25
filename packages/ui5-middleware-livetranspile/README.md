# UI5 middleware for live transpiling ES6+ sources

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing on-the-fly transpilation of ES6+ sources to ES5 (incl IE11 compatability :) )

## Install

```bash
npm install ui5-middleware-livetranspile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
verbose logging

- excludePatterns: `String<Array>`  
array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  
e.g. 3-rd party libs in `lib/*`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-livetranspile": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-livetranspile",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livetranspile
    afterMiddleware: compression
    configuration:
      debug: true
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

## How it works

The middleware intercepts every `.js`-file before it is sent to the client. The file is then transpiled on-the-fly via `babel`, including dynamic creation of a `sourcemap`.

The transpiled code and the `sourcemap` are subsequently delivered to the client instead of the original `.js`-file. Because of the `sourcemap`, setting breakpoints in the **original (ES6+) source** will cause the debugger to stop **when the corresponding transpiled source code is reached**.

> `async/await` is transpiled at runtime, but the required `asyncGenerator` sources are not yet delivered on the fly. They need to be `sap.ui.require`d or `<script src="...">`d separately.  

## Misc/FAQ

`.js`-files requested by the server that are missing in the application (such as `Component-preload.js`) are logged as a `WARN` message, but will not cause the middleware to break/stop.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
