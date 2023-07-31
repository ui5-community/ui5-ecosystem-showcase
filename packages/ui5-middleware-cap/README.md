# ui5-middleware-cap

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `ui5-middleware-cap` is a UI5 tooling middleware which enables the integration of a CAP server into the UI5 development server via the CAP server express middlewares. In addition to the middleware the CAP server project needs to be added as dependency so that the server is detected and attached properly. The pre-defined routes in the CAP server are reused.

> :construction: **Note**
> This middleware is still work in progress and not final yet!

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Usage

Add a `devDependency` to the `ui5-middleware-cap`:

```sh
npm add ui5-middleware-cap -D
```

Register the middleware in the `ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-cap
    afterMiddleware: compression
```

That's it!

## Configuration options (in `$yourapp/ui5.yaml`)

- `moduleId`: `<string>`
If specified, the CAP server will be loaded from the NPM package with the given moduleId (package name). If not provided, the middleware will lookup the CAP server from the dependencies.

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
