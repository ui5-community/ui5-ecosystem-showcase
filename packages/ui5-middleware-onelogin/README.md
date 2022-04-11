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

Currently you can define the properties in the configuration (see below) or the following environment variables are used.

- path: `string` the url to the fiori launchpad or just hostname and port of the SAP system, /sap/bc/ui2/flp will then be automatically added
- username`(optional)`: `string` Username to be used to login to the launchpad
- password`(optional)`: `string`Password used to login
- useCertificate`(optional)`: `boolean` use a certificate to login instead of username and password
- debug`(optional)`: `boolean` true will open up the playwright browser so you can see what's going on

**NB:** If you choose to use the certificate login then check the property AutoSelectCertificateForUrls in chrome://policy if it holds the url pattern for your system. [Playwright](https://github.com/microsoft/playwright/issues/1799) has an issue to handle the certificate prompt. Another workaround is to set debug and useCertificate to true in the configuration and press ok when the prompt opens

You can either add the following properties to your .env file, remember to add that to your .gitignore

- UI5_MIDDLEWARE_ONELOGIN_LOGIN_URL or UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI
- UI5_MIDDLEWARE_ONELOGIN_USERNAME
- UI5_MIDDLEWARE_ONELOGIN_PASSWORD

Use of environment variables or values set in a `.env` file will be used.

Other options is to either set it in the yaml file or if left blank it will prompt you for the details.

You can choose to just add the url and let the rest be prompted in the terminal
![Login prompt](./assets/prompt.png)

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
        useCertificate: true / false (use a certificate to login instead of username and password)
        debug: true / false (true will open up the playwright browser so you can see what's going on)
```

## License

MIT
