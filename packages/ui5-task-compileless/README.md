# UI5 task for compiling less files

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling compiling of less files in your app folder.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-task-compileless --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`  
  verbose logging

- lessToCompile `String<Array>`  
  array of less resources specified as paths or glob patterns which should be compiled 

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-compileless": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
   - name: ui5-task-compileless
     afterTask: replaceVersion
     configuration:
        debug: true
        # lessToCompile: (Optional by default css from manifest will be used)
        #   - "css/style.less"
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
