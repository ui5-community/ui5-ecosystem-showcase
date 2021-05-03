# UI5 task for compiling less files 

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling compiling of less files in your app folder.

## Install

```bash
npm install ui5-task-compileless --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`  
  verbose logging

- appFolderPath: `String`
  path to your appfolder (default `webapp`)

- lessToCompile `String<Array>`  
  array of less resources specified as paths or glob patterns which should be compiled 

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-compileless": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-compileless",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
   - name: ui5-task-compileless
     afterTask: replaceVersion
     configuration:
         debug: true
         appFolderPath: webapp
#    lessToCompile: (Optional by default css from manifest will be used)
#      - "css/style.less"
```

## How it works

The task can be used to compile less files in your app folder by using [less-openui5](https://github.com/SAP/less-openui5).

It can also include less file from the ui5 dependencies for example
```less
@import "/resources/sap/ui/core/themes/base/base.less";
```
To get all the less variable that are defined in the sap ui theme core.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@sebbi](https://app.slack.com/client/T0A7MQSJ1/D01TDU3RMSQ/user_profile/UBV5L8N8M) a beer or buy [@marcel_schork](https://twitter.com/marcel_schork) a coke when you see them.
