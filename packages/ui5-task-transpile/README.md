# UI5 task for transpiling ES6+ sources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling transpiling.

## Install

```bash
npm install ui5-task-transpile --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
verbose logging

- excludePatterns: `String<Array>`  
array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  
e.g. 3-rd party libs in `lib/*`

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-transpile": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-transpile",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-transpile
    afterTask: replaceVersion
    configuration:
      debug: true
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

## How it works

The task can be used to transpile ES6+ JavaScript code to ES5 by using `babel`.

## License

[THE DERIVED BEER-WARE LICENSE](../../LICENSE)

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
