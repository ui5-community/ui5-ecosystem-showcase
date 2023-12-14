# ui5-middleware-cap

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `ui5-middleware-cap` is a UI5 tooling middleware which is used to improve the development experience for the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/about/) and enables the integration of a CDS server into the UI5 development server via the CDS server express middlewares. In addition to the middleware the CDS server project needs to be added as dependency so that the server is detected and attached properly. The pre-defined routes in the CDS server are reused.

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
    mountPath: "/cap"
```

That's it!

## Configuration options (in `$yourapp/ui5.yaml`)

- `moduleId`: `<string>`
If specified, the CDS server will be loaded from the NPM package with the given moduleId (package name). If not provided, the middleware will lookup the CDS server from the project `dependencies` or `devDependencies`.
- `mountPath`: `<string>`
If specified, the CDS server will be available at the specified url.
- `options`: `<object>` (default: `{ "with-mocks": true, "in-memory?": true }` )
Allows to provide some CLI options for the `cds serve` command which is called internally to create the middleware functions and embed them into the UI5 development server:
  - `with-mocks`: `<boolean>`
    It starts in-process mock services for all required services configured in package.json#cds.requires, which don't have external bindings in the current process environment.
  - `in-memory[?]`: `<boolean>`
    Automatically adds a transient in-memory database bootstrapped on each (re-)start in the same way cds deploy would do, based on defaults or configuration in package.json#cds.requires.db. Add a question mark to apply a more defensive variant which respects the configured database, if any, and only adds an in-memory database if no persistent one is configured.

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
