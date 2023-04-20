# UI5 task for zipping all project resources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling zipping.

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
Set this to `true` if you also want to generate the unzipped resources in the `dist` folder. Otherwise, it will only create the zipped archive.

- includeDependencies: `true|false` or `String<Array>`
Set this to `true` if you also want to include the dependencies (UI5 libraries) in the zip archive. Otherwise, it will only include the workspace files (controller, views, etc). In order to select only specific dependencies to be included in the final zip you just need to specify the list of dependencies (value of `ui5.yaml`: `metadata > name`).

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-zipper": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-zipper",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml` for UI5 tooling 2.x:

```yaml
builder:
  customTasks:
  - name: ui5-task-zipper
    afterTask: uglify
    configuration:
      archiveName: "webapp"
      additionalFiles:
      - xs-app.json
```

or for UI5 tooling 3.x:

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

> :warning: For UI5 Tooling V3 the configuration `afterTask: uglify` needs to be adopted to `afterTask: generateVersionInfo`. This works for the UI5 Tooling V2 and V3.

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
