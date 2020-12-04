# UI5 task for checking missing translations in i18n properties used in XML views

Task for [ui5-builder](https://github.com/SAP/ui5-builder), checking missing translations.

## Install

```bash
npm install ui5-task-i18ncheck --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
Verbose logging

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-i18ncheck": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-i18ncheck",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-i18ncheck
    afterTask: replaceVersion
    configuration:
      debug: true
```

## How it works

The task reads all XML views and i18n properties files. Then the task cross-checks for missing translations and gives a warning if it can catch one. Currently, views created in javascript is not included in the check.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally, you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) or [@fatihpense](https://twitter.com/fatihpense) a coke when you see them.