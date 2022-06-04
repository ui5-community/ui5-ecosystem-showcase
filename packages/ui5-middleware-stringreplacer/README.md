# UI5 middleware for live string replace in files

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a live string replace on files matched by the includePatterns `files` array configuration option.

## Install

```bash
# Using npm
npm install ui5-middleware-stringreplacer --save-dev

# Using pnpm
pnpm add --save-dev ui5-middleware-stringreplacer

# Using yarn
yarn add --dev ui5-middleware-stringreplacer
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
    "ui5-middleware-stringreplacer": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-stringreplacer",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-stringreplacer
      afterMiddleware: compression
      configuration:
        debug: true
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
stringreplacer.BASE_URL_PLACEHOLDER = http://localhost:2000
stringreplacer.some.deeply.nested.ANOTHER_PLACEHOLDER = Replace with this text
```

## Multiple environments

You can keep multiple `.env` files and load a specific environment at build or serve time.

```
- dev.env
- staging.env
- prod.env
- package.json
```

```json
 "scripts": {
    "serve:dev": "UI5_ENV=dev ui5 serve",
    "serve:staging": "UI5_ENV=staging ui5 serve",
    "serve:prod": "UI5_ENV=prod ui5 serve",
 }
```

With `UI5_ENV` set, the strings will be loaded from the `<UI5_ENV>.env` file.

## How it works

The middleware replaces the placeholders with their values in the files matched by the patterns. All the string placeholders which are maintained in the process environment with prefix 'stringreplacer.' will be taken into account. If no environment name is set through the process environment variable UI5_ENV, then by default the file`./.env` is loaded.
