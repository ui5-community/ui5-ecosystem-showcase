# UI5 task to flatten the library folder structure

Task for [ui5-builder](https://github.com/SAP/ui5-builder), to prepare build result for deployment to SAP NetWeaver.

## Prerequisites

- Requires `@ui5/cli` v2.4.0+ (to support [specVersion 2.2](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-22))

## Install

```bash
npm install --save-dev ui5-task-flatten-library
```

or

```bash
yarn add --dev ui5-task-flatten-library
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-flatten-library": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-flatten-library",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
