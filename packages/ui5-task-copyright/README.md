# UI5 task for appending copyright headers for TypeScript, JavaScript and XML files

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task for [ui5-builder](https://github.com/SAP/ui5-builder) for appending copyright headers to every TypeScript (`*.ts`), JavaScript (`*.js`), or XML (`*.xml`) source file.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-task-copyright --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- copyright: `String` (via env var: `UI5_TASK_COPYRIGHT_FILE` expects file name)
  the value of the copyright or the path to a file containing the copyright statement - if not given, the task will be skipped - the copyright can also be injected by the environment variable `UI5_TASK_COPYRIGHT_FILE` which must point to an existing file and then the copyright is extracted from this file

- copyrightPlaceholder: `String` (defaults to: `copyright`, env var: `UI5_TASK_COPYRIGHT_PLACEHOLDER_COPYRIGHT`)
  the name of the copyright placeholder to check for in the copyright comments and to replace with the copyright value (will replace all hits of `${copyright}` or `@copyright@`)

- currentYearPlaceholder: `String` (defaults to: `currentYear`, env var: `UI5_TASK_COPYRIGHT_PLACEHOLDER_CURRENT_YEAR`)
  the name of the currentYear placeholder in the copyright comments which will be replaced with the currentYear value (will replace all hits of `${currentYear}` or `@currentYear@`)

- excludePatterns: `Array<String>`
  array of paths inside `$yourapp/` to exclude from the minification, e.g. 3-rd party libs in `lib/*`. defaults to an empty array `[]`.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-copyright": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-copyright
    beforeTask: replaceCopyright
    configuration:
      copyright: "Copyright ${currentYear} UI5 Community"
      excludePatterns:
      - "thirdparty/"
```

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
