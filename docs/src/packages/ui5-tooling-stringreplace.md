# UI5 Tooling Extension for Replacing Strings

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

Task and Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a live string replace on files matched by the includePatterns `files` array configuration option.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
# Using npm
npm install ui5-tooling-stringreplace --save-dev

# Using pnpm
pnpm add --save-dev ui5-tooling-stringreplace

# Using yarn
yarn add --dev ui5-tooling-stringreplace
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
  verbose logging
- files: `string`|`array`  
  Placeholders will be replaced with their values in files matched by this glob pattern
- replace: `array`  
  List of placeholder, value pairs

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-tooling-stringreplace": "*"
    // ...
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
    - name: ui5-tooling-stringreplace-task
      afterTask: replaceVersion
      configuration:
        files:
          - "**/*.js"
          - "**/*.xml"
        replace:
          - placeholder: ${project.artifactId}
            value: my.sample.app
          - placeholder: ${project.version}
            value: 1.0.0-SNAPSHOT
          - placeholder: "{{app.AppTitle}}"
            value: My Sample App

server:
  customMiddleware:
    - name: ui5-tooling-stringreplace-middleware
      afterMiddleware: compression
      configuration:
        debug: true
        prefix: UI5_ENV # default
        path: ./ # default
        files:
          - "**/*.js"
          - "**/*.xml"
        replace:
          - placeholder: ${project.artifactId}
            value: my.sample.app
          - placeholder: ${project.version}
            value: 1.0.0-SNAPSHOT
          - placeholder: "{{app.AppTitle}}"
            value: My Sample App
```

3. Maintain all string placeholders and values in `.env` file

```env
stringreplace.BASE_URL_PLACEHOLDER = http://localhost:2000
stringreplace.some.deeply.nested.ANOTHER_PLACEHOLDER = Replace with this text
```

## Multiple environments

You can keep multiple `.env` files and load a specific environment at build or serve time.

```
- dev.env
- staging.env
- prod.env
- package.json
```

You can define our own prefix in `$yourapp/ui5.yaml` using configuration `prefix` otherwise will default to `UI5_ENV`.

You can specify the `<UI5_ENV>.env` location by setting the `path` property in the configuration. Default path fallback is set to `./` to find the `<UI5_ENV>.env` file in the same location as the executed `package.json` file.  

```json
 "scripts": {
    "build:dev": "UI5_ENV=dev ui5 build",
    "build:staging": "UI5_ENV=staging ui5 build",
    "build:prod": "UI5_ENV=prod ui5 build",
 }
```

With `UI5_ENV` set, the strings will be loaded from the `<UI5_ENV>.env` file.

## How it works

### Task

The task reads all files based on configuration patterns and replaces all string placeholders with values for all files. All the string placeholders which are maintained in the process environment with prefix 'stringreplace.' will be taken into account. If no environment name is set through the process environment variable UI5_ENV, then by default the file`./.env` is loaded.

### Middleware

The middleware replaces the placeholders with their values in the files matched by the patterns. All the string placeholders which are maintained in the process environment with prefix 'stringreplace.' will be taken into account. If no environment name is set through the process environment variable UI5_ENV, then by default the file`./.env` is loaded.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally, you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) a beer or buy [@pmuessig](https://twitter.com/pmuessig) or [@TheVivekGowda](https://twitter.com/TheVivekGowda) a coke when you see them.
