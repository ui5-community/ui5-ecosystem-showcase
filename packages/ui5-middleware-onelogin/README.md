# UI5 onelogin middleware

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling a generic login support.

The middleware will on first request try to login with the provided credentials and save the cookie for further requests. This uses playwright in a headless mode to run the login process.
The first request will take longer.

This has been tested with Azure AD, Google, OpenAM and the SAP Gateway login pages.

Merge requests with other login handlers are more than welcome via pull request.

## Install

```bash
npm install ui5-middleware-onelogin --save-dev

```

## Configuration options (in `$yourapp/ui5.yaml`)

Currently you cna define the properties in the configuration (see below) or the following environment variables are used.

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
```

## License

MIT
