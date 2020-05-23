# UI5 task for replacing strings from any files while creating build

Task for [ui5-builder](https://github.com/SAP/ui5-builder), replacing string values.

## Install

```bash
npm install ui5-task-stringreplacer --save-dev
```

or

```bash
yarn install --dev ui5-task-stringreplacer
```

## Configuration options (in `$yourapp/ui5.yaml`)

```bash
files: ["**/*.js", "**/*.xml"]
strings:
    [
        { placeholder: $PLACEHOLDER1$, value: Actual Value 1 },
        { placeholder: $PLACEHOLDER2$, value: Actual Value 2 },
    ]
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-stringreplacer": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-stringreplacer",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
    - name: ui5-task-stringreplacer
      afterTask: replaceVersion
      configuration:
        files: ["**/*.js", "**/*.xml"]
        strings:
          [
            { placeholder: $PLACEHOLDER1$, value: Actual Value 1 },
            { placeholder: $PLACEHOLDER2$, value: Actual Value 2 },
          ]
```

## How it works

The task reads all files based on configuration patterns and replaces all placeholders with values for all files.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally, you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) or [@TheVivekGowda](https://twitter.com/TheVivekGowda) a coke when you see them.
