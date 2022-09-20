# UI5 task for zipping all project resources
## <span style="color:red">This task is only relevant for standalone applications!</span>

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling cachebusting for standalone applications.

## Install

```bash
npm install ui5-task-cachebuster --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `true|false`\
Verbose logging
- moveResouces: `true|false`\
default true: moves all the files in the build to a subfolder named `/~timestamp~/`\
false: no files are moved and no subfolder created
- excludeFromMove : eg. `["index.html", "logout.html"]`\
only relevant if moveResources is `true`\
default `["index.html"]`: the files which should not be moved into the timestamp subfolder

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

2. configure it in `$yourapp/ui5.yaml`:\

What is possible:
```yaml 
builder:
  customTasks:
  - name: ui5-task-cachebuster
    afterTask: uglify
    configuration:
      debug: true | false
      moveResources: true | false
      excludeFromMove: ["index.html", "logout.html"]
```
For app in SAP BTP in Cloud Foundry environment with managed approuter:
```yaml
builder:
  customTasks:
  - name: ui5-task-cachebuster
    afterTask: uglify
    configuration:
      moveResources: false
```

If ui5-task-zipper is used you need to include the beforeTask config.
```yaml
  - name: ui5-task-cachebuster
    beforeTask: ui5-task-zipper    
```

## How it works
**This is only relevant for standalone applications, not apps that run in SAP Fiori Launchpad**\

Why do we need this? 
"Cache busting is a way for updates to still happen when using web caching."
To make sure that the newest deployed changes of the webapp are displayed, even though web caching is used by the client browsers, a cachetoken is added to the paths which point to the static files. This cachetoken is changing for each build, therefore the browser has to reload all resources if the cachetoken has changed.

Standalone apps have to explicitly deal with cachbusting.

This task can be used to move all files except index.html to a subfolder with the current timestamp as a name. In the index.html the `data-sap-ui-resourceroots` path is updated to include the `/~timestamp~/` path like so: `{"my.app": "./~1234241421~/"}`.
This dynamic cachebusting token ensures that the static resources will have to be reloaded after a new build was deployed.

If the app is deployed on SAP BTP in the Cloud Foundry environment with the managed approuter, the configuration `moveResources: false` should be used, since the `~token~` in the path to the files will be ignored.

If you included any other .html files in your project who's path should not change, like a logout.html which is routed to in the xs-app.json, you should add it to the `excludeFromMove` configuration. This takes an array of file paths (relative to webapp folder) which should not be moved into the timestamp subfolder.

Use Cases:
- Standalone Web-Server:
  Adapt index.html + Move files into timestamp folder 
- CloudFoundry HTML5 Apps with managed approuter:
	Just adapt index.html
-	Neo HTML5 Apps:
	Adapt index.html + enable cachebuster handling in neo-app.json with ui5CacheBuster: true

## License

This work is [licensed](../../LICENSE) under Apache 2.0.
