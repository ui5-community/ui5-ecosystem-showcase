# UI5 task for minifying XML resources (like views, fragments, etc.)

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling XML minification based on [minify-xml](https://github.com/kristian/minify-xml#readme).

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
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-minify-xml",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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
