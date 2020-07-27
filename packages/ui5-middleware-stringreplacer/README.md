# UI5 middleware for live string replace in files

Middleware for [ui5-server](https://github.com/SAP/ui5-server), doing a live sring replace on files matched by the includePatterns configuration option.

## Install

```bash
npm install ui5-middleware-stringreplacer --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
  verbose logging
- includePatterns: `string`|`array`  
  Placeholders will be replaced with their values in files matched by this pattern
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
      includePatterns: manifest.json
      replace:
        - placeholder: ${project.artifactId}
          value: my.sample.app
        - placeholder: ${project.version}
          value: 1.0.0-SNAPSHOT
        - placeholder: '{{app.AppTitle}}'
          value: My Sample App
```

## How it works

The middleware replaces the placeholders with their values in the files matched by the patterns.