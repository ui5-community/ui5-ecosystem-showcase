# UI5 task for minifying XML resources (like views, fragments, etc.)

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling XML minification based on [minify-xml](https://github.com/kristian/minify-xml#readme).

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://ui5.github.io/cli/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://ui5.github.io/cli/pages/Configuration/#specification-version-30))

> :warning: **UI5 CLI Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 CLI V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 CLI. But the usage of the latest UI5 CLI is strongly recommended!

## Install

```bash
npm install ui5-task-minify-xml --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- minifyOptions: `Object`
  all options available from the [minify-xml](https://github.com/kristian/minify-xml#options) plugin, with one additional (non-compliant) `collapseWhitespaceInAttributeValues` (`boolean`) option, due to UI5 having a lot of options (e.g. with JSON values) where collapsing whitespace is beneficial. defaults to all standard options of `minify-xml` and `collapseWhitespaceInAttributeValues` enabled.

- fileExtensions: `String|Array<String>`
  the file extensions to glob for. defaults to `xml`.

- excludePatterns: `Array<String>` 
  array of paths inside `$yourapp/` to exclude from the minification, e.g. 3-rd party libs in `lib/*`. defaults to an empty array `[]`.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-minify-xml": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-minify-xml
    afterTask: replaceVersion
    configuration:
      minifyOptions:
        removeComments: true
        collapseEmptyElements: true
        collapseWhitespaceInAttributeValues: true
        # ... further minify-xml attributes
      fileExtensions:
      - "xml"
      - "edmx"
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

## License

This work is [licensed](../../LICENSE) under the Apache 2.0 license.
