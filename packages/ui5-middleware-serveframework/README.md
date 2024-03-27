# UI5 middleware to serve a locally built UI5 framework version

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Middleware for [ui5-server](https://github.com/SAP/ui5-server), delivering the UI5 framework from a locally built version. The first time a UI5 version is being used (derived from the framework configuration of the project), it will be built and locally stored in the `~/.ui5/ui5-middleware-serveframework` folder per version. For any follow-up usage of the version, it will be served from the local folder. Benefits are the usage of the preload files and pure static file access.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-middleware-serveframework --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- `debug`: *`boolean`*, default: `false`
- `ui5VersionEnvVariable`: *`string`*
  Name of environment variable that contains ui5 version (in case you want to override framework version from ui5.yaml)
- `envFilePath`: *`string`*, default: `./.env`
  Path to file with environment variables

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-serveframework": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-serveframework
    afterMiddleware: compression
    configuration:
      ui5VersionEnvVariable: UI5_VERSION
      envFilePath: "./.dev.env"
```

## How it works

The middleware looks-up the UI5 framework version in the `ui5.yaml` and then first builds the framework with all libraries locally and serves the content of those libraries from there.

## Development

If you want to contribute to `ui5-middleware-serveframework`, please use [`Prettier`](https://prettier.io) for code formatting/style and apply the rules from `./.prettierrc`. Thanks 🙏!

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, you may buy [@pmuessig](https://twitter.com/pmuessig) a coke.
