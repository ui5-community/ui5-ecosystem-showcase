# UI5 task for zipping all project resources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling zipping.

## Install

```bash
npm install ui5-task-mvn-lib-provider --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `{boolean}`; default: `true`  
  Verbose logging

- path: `{String}`  
  path to .jar containing the ui5 library

- (optional) mvnPath: `String`
  path to local maven binary, otherwise relied on to be present in the environment (aka `PATH`)

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-mvn-lib-provider": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-mvn-lib-provider",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-mvn-lib-provider
    afterTask: uglify
    configuration:
      
```

## How it works


## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or Simon Coen a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.