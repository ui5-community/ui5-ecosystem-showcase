# UI5 task for zipping all project resources

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling zipping.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-task-zipper --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`
Verbose logging

- archiveName: `String`
Desired name for the `.zip` archive.
Default value: `<app-id.zip>`

- additionalFiles: `String<Array>` or `Object<Array>`
List of files to be included in the ZIP archive relative to the project root or Map of of files to be included in the ZIP archive relative to the project root and target path in the ZIP archive.

- onlyZip: `true|false`
Set this to `true` to omit the resources contained in the ZIP from the build result (typically in the `dist` folder). By default, the build result contains all resources and the ZIP.

- includeDependencies: `true|false` or `String<Array>`
Set this to `true` if you also want to include the dependencies (UI5 libraries) in the zip archive. Otherwise, it will only include the workspace files (controller, views, etc). In order to select only specific dependencies to be included in the final zip you just need to specify the list of dependencies (value of `ui5.yaml`: `metadata > name`).

- relativePaths `true|false`
Set this to `true` if you want to turn absolute data source paths in the `manifest.json` into relative paths, e.g. `"uri": "/backend/"` will be turned into `"uri": "backend/"` upon ZIP creation. This is useful when deploying the ZIP to the HTML Application Repository on SAP BTP, Cloud Foundry environment to later consume it in SAP Build Work Zone, standard edition, which only supports relative paths.

**NOTE:** Starting with release `3.0.5`, the `ui5-task-zipper` includes the generated workspace resources such as the self-contained bundles (`sap-ui-custom.*` files). To do so, it is important that the `ui5-task-zipper` is running as last task in the build.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-zipper": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-zipper
    afterTask: generateVersionInfo
    configuration:
      archiveName: "webapp"
      additionalFiles:
        "app/foo/xs-app.json":      # source path will be used as target path
        "path/to/foo.js": "foo.js"  # file will be placed in root of ZIP file
        "path/to/files/bar.js": "some/custom/dir/bar.js"
```

### Select the dependencies to include

With the configuration option `includeDependencies` you can also specifiy a list of dependencies to be included in the zip file. To do so, specify a list of dependencies using their `ui5.yaml`: `metadata > name` property:

```yaml
builder:
  customTasks:
  - name: ui5-task-zipper
    afterTask: generateVersionInfo
    configuration:
      includeDependencies:
      - sap.ui.table
      - ui5.ecosystem.demo.lib
```

## How it works

The task can be used to zip all project resources in an archive.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or [@IObert_](https://twitter.com/IObert_) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
diff --git a/packages/ui5-task-zipper/readme.md b/packages/ui5-task-zipper/readme.md
