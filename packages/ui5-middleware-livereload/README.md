# UI5 middleware for live reloading `webapp` sources on change

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a live reload when files inside `$yourapp` change, e.g. on save.

## Install

```bash
npm install ui5-middleware-livereload --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
  verbose logging
- extraExts: `string`, default: "xml,json,properties"  
  file extensions other than `js`, `html` and `css` to monitor for changes
- port: `integer`, default: an open port choosen from _35729_  
  port the live reload server is started on
- watchPath|path: `string`, default: `webapp`  
  path inside `$yourapp` the reload server monitors for changes
- exclusions: one or many `regex`. By default, this includes `.git/`, `.svn/`, and `.hg/`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-livereload": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-livereload",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      watchPath: "webapp"
```

or with `path` instead of `watchPath`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      path: "webapp"
```

Reload from multiple paths:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      path: 
            - "webapp"
            - "../my.reuse.library/src/my/reuse/library"
```

Exclude single subpath from `path`s/ `watchPath`s:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      watchPath: "webapp"
      exclusions:
            - "wdi5/"
```

Exclude multiple subpaths from  `path`s/ `watchPath`s:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      watchPath: "webapp"
      exclusions:
          - "wdi5/"
          - "integration/"
```

## How it works

The middleware launches a `livereload`-server on the specified `port`, listening to changes in the specified `path` or `watchPath` inside your application directory.

When changes are detected, a reload is triggered to **all connected clients** - so all browsers having `$yourapp` will reload the application. The reload is `#`-aware, meaning the current displayed route in your single-page UI5 app is kept steady.

## HTTP/2 support

The middleware supports HTTP/2 automatically, when the UI5 server is started with the --h2 option. It uses the same SSL key and certificate, either set using the --key and --cert options, or using the default ~/.ui5/server/server.key and ~/.ui5/server/server.crt.

## Misc/FAQ

yep, cross-browser, cross-platform.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
