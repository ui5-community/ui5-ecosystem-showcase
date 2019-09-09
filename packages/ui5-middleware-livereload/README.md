# UI5 middleware for live reloading `webapp` sources on change

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a live reload when files inside `$yourapp` change, e.g. on save.

## Install

```bash
npm install ui5-middleware-livereload --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
  verbose logging
- ext: `string`, default: "xml,json,properties"  
  file extensions other than `js`, `html` and `css` to monitor for changes
- port: `integer`, default: 35729  
  port the live reload server is started on
- path: `string`, default: `webapp`  
  path inside `$yourapp` the reload server monitors for changes

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-livereload": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      ext: "xml,json,properties"
      port: 35729
      path: "webapp"
```

## How it works

The middleware launches a `livereload`-server on the specified `port`, listening to changes in the specified `path` inside your application directory.

When changes are detected, a reload is triggered to **all connected clients** - so all browsers having `$yourapp` will reload the application. The reload is `#`-aware, meaning the current displayed route in your single-page UI5 app is kept steady.

## Misc/FAQ

yep, cross-browser, cross-platform.

## License

[THE DERIVIED BEER-WARE LICENSE](../../LICENSE)

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
