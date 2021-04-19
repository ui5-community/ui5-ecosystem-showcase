# UI5 middleware for delivering content from JAR files

Middleware for [ui5-server](https://github.com/SAP/ui5-server), delivering the content of JAR files.

## Install

```bash
npm install ui5-middleware-webjars --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- classpathFile: `string`

  the file containing the classpath (list of files, separated with the path delimiter) which can be created via:

  > `mvn clean dependency:build-classpath -Dmdep.cpFile=target/classpath`

- rootPath: `string`

  the root path to the static resources on your system

- jarRootPath: `string`, default: `META-INF/resources/`

  the root path in the JAR file containing the static resources

- debug: `boolean`, default: `false`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-webjars": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-webjars",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-webjars
    afterMiddleware: compression
    configuration:
      rootPath: "jars"
      jarRootPath: "META-INF/"
```

## How it works

The middleware searches for JAR files in the `rootPath`, loads them and serves the content from JAR files following the web static resources concept of Servlet 3.0 (WebJARs). By default, this allows to consume static resources from the JAR files from within the `META-INF/resources/` path. When using JAR files following a derived web static resources concept it is possible to override the JAR root path with the configuration `jarRootPath`.

```text
jarRootPath: "META-INF/resources/"

META-INF/resources/my/resource/path/Resource.js => http://localhost:8080/my/resource/path/Resource.js

---
jarRootPath: "META-INF/"

META-INF/resources/my/resource/path/Resource.js => http://localhost:8080/resources/my/resource/path/Resource.js
```

## Development

If you want to contribute to `ui5-middleware-webjars`, please use [`Prettier`](https://prettier.io) for code formatting/style and apply the rules from `./.prettierrc`. Thanks 🙏!

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, you may buy [@vobu](https://twitter.com/vobu) a beer or [@pmuessig](https://twitter.com/pmuessig) a coke.
