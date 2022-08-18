# UI5 task for zipping all project resources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling cachebusting for standalone applications.

## Install

```bash
npm install ui5-task-cachebuster --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`
Verbose logging
- moveResouces: `true|false`
default true: moves all the files in the build to a subfolder named "/~timestamp~/"
false: no files are moved and no subfolder created
- updateIndexHTML:`true|false`
default true: the module paths in "data-sap-ui-resourceroots" in the index.html are updated to include the "/~timestamp~/" path
- excludeFromMove : ["index.html","logout.html"]
only relevant if moveResources is true
default ["index.html"]: the files which should not be moved into the timestamp subfolder

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-cachebuster": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-cachebuster",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-cachebuster
    afterTask: uglify
    configuration:
      configuration:
      debug: true | false
      moveResources: true | false
      updateIndexHTML: true | false
      excludeFromMove: ["index.html", "logout.html"]
```
If ui5-task-zipper is used you need to include the beforeTask config.
```yaml
  - name: ui5-task-cachebuster
    beforeTask: ui5-task-zipper    
```

## How it works
**This is only relevant for standalone applications, not apps that run in SAP FLP**
The task can be used to move all files except index.html to a subfolder with the current timestamp as a name. In index.html the data-sap-ui-resourceroots path is updated to '{"my.app": "./~1234241421~/"}.
This dynamic cachebusting token ensures that the resources will have to be reloaded after a new build was deployed.

If the app is deployed on SAP BTP in the Cloud Foundry environment with the managed approuter, the configuration 
moveResources: false
updateIndexHTML: true 
should be used.

## License

This work is [licensed](../../LICENSE) under Apache 2.0.
