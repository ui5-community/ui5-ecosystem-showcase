# UI5 task for transpiling ES6+ sources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling transpiling.

## Install

```bash
npm install ui5-task-transpile --save-dev
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-transpile": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-transpile
    afterTask: replaceVersion
```

## How it works

The task can be used to transpile ES6 and later JavaScript code to ES5 by using `babel`.

## License

[THE DERIVIED BEER-WARE LICENSE](../../LICENSE)

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
