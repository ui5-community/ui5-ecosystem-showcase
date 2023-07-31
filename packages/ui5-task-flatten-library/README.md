# UI5 task to flatten the library folder structure

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), to prepare build result for deployment to SAP NetWeaver.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3.x.x` only support UI5 Tooling V3. Any previous release below version `3` (if available) also supports older versions of the UI5 Tooling. But it's strongly recommended to upgrade to UI5 Tooling V3!

## Install

```bash
# Using npm
npm install ui5-task-flatten-library --save-dev

# Using pnpm
pnpm add --save-dev ui5-task-flatten-library

# Using yarn
yarn add --dev ui5-task-flatten-library
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-flatten-library": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
    - name: ui5-task-flatten-library
      afterTask: generateResourcesJson

```

## How it works

- For `src` files it removes the `/resources/${projectNamespace}/` part of the path (e.g. `dist/resources/my/lib/library.js` => `dist/library.js`)
- All `test` files (`/test-resources/`) will be omitted from the build result
- A warning is logged for `src` files that are not part of the project namespace

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally, you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or [@matthiaso](https://twitter.com/matthiaso) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
