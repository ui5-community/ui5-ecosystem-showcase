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

- additionalFiles: `String<Array>`
List of files to be included in the ZIP archive relative to the project root.

- onlyZip: `true|false`
Set this to true if you also want to generate the unzipped resources in the `dist` folder. Otherwise, it will only create the zipped archive.

- includeDependencies: `true|false`
Set this to true if you also want to include the dependencies (UI5 libraries) in the zip archive. Otherwise, it will only include the workspace files (controller, views, etc).

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

2. configure it in `$yourapp/ui5.yaml`:

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

## How it works

The task can be used to zip all project resources in an archive.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or [@IObert_](https://twitter.com/IObert_) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
diff --git a/packages/ui5-task-zipper/readme.md b/packages/ui5-task-zipper/readme.md
