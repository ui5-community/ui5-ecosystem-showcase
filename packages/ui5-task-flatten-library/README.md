# UI5 task to flatten the library folder structure

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), to prepare build result for deployment to SAP NetWeaver.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this UI5 CLI extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

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

## UI5 CLI Output Style

Starting from `@ui5/cli` version 3.8.0, the UI5 CLI introduces a new build option known as "Output Style." This feature allows developers to switch between various output styles when building their projects. Now you have the flexibility to omit both this project namespace and the “resources” directory. Imagine “/resources/sap/m/RangeSlider.js” transforming into “./RangeSlider.js.” This results in a flat build output.  
The available output styles include:

- `Default`: The default directory structure for every project type. For applications, this is identical to "Flat", and for libraries, it is "Namespace". Other types have a more distinct default output style.
- `Flat`: Omits the project namespace and the "resources" directory.
- `Namespace`: Respects the project namespace and the "resources" directory, maintaining the original structure.

To learn more about this feature and to migrate your project to the native Output Style feature instead of using the custom task, refer to the [associated blog post](https://blogs.sap.com/?p=1898173?source=email-global-notification-bp-new-in-tag-followed) or the [CLI documentation page](https://ui5.github.io/cli/stable/pages/CLI/#ui5-build).

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally, you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or [@matthiaso](https://twitter.com/matthiaso) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
