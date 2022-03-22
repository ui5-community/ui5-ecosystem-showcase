# UI5 onelogin middleware

This example is for how to run a server side fiori launchpad but with a local app instead of served from the server

## Configuration options (in `$yourapp/ui5.yaml`)

Currently you can define the properties in the configuration (see below) or the following environment variables are used.
Check the config example below. If you run this current example, it will show the Fiori launchpad from ES5 embedded. 
**NB: The app needs to be deployed first with the same namespace**

It is strongly recommended to use the .env file and add that to your .gitignore file.

- UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL
- UI5_MIDDLEWARE_ONELOGIN_USERNAME
- UI5_MIDDLEWARE_ONELOGIN_PASSWORD

Use of environment variables or values set in a `.env` file will be used.

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-onelogin": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-onelogin",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-onelogin
      afterMiddleware: compression
      configuration:
        path: <Login URL>
        username: <Login User>
        password: <Login Password>
        debug: true / false (true will open up the playwright browser so you can see what's going on)
    - name: ui5-middleware-servestatic
      afterMiddleware: ui5-middleware-onelogin
      mountPath: /sap/bc/ui5_ui5/sap/<Name_of_your_app>
      configuration:
        rootPath: "./webapp"
    - name: ui5-middleware-simpleproxy
      afterMiddleware: ui5-middleware-onelogin
      mountPath: /sap
      configuration:
        baseUri: "https://sapes5.sapdevcenter.com/sap"
        excludePatterns:
        - "/bc/ui5_ui5/sap/<Name_of_your_app>/**"
```

## License

MIT
