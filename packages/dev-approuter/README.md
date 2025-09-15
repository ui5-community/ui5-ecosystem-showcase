# dev-approuter

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `dev-approuter` is a dev time wrapper for the [SAP Application Router](https://www.npmjs.com/package/@sap/approuter) that can serve [UI5](https://ui5.sap.com/) and [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/) apps that are added as (dev)dependencies to the approuter's `package.json`. A few key notes to begin with:
- The `dev-approuter` utilizes the [SAP Application Router's extension API](https://help.sap.com/docs/btp/sap-business-technology-platform/extension-api-of-application-router) by adding UI5 servers as extensions - providing the full [UI5 CLI](https://ui5.github.io/cli/v3/) experience.
- A linked SAP CDS app is started on a different port - this is to mimic a deployed architecture. The corresponding destination is automatically created for you.
- In order to safely separate development configuration from productive code, the `dev-approuter` introduces the concept of the `xs-dev.json` - think of it as an extension to the [`xs-app.json`](https://help.sap.com/docs/btp/sap-business-technology-platform/routing-configuration-file).
- As the name suggests, the `dev-approuter` is for development only and not meant to be used in production.

---

1. [Prerequisites](#prerequisites)
2. [Starting the `dev-approuter`](#starting-the-dev-approuter)
3. [Adding and serving apps](#adding-and-serving-apps)
    - [UI5 apps](#ui5-apps)
    - [SAP CDS server](#sap-cds-server)
4. [The `xs-dev.json` file](#the-xs-devjson-file)
5. [Using the `dev-approuter` and SAP Application Router simultaneously](#using-the-dev-approuter-and-sap-approuter-simultaneously)
6. [Extending the `dev-approuter`](#extending-the-dev-approuter)

## Prerequisites

- [Node.js](https://nodejs.org/en) version 18 or higher.

## Starting the `dev-approuter`

The `dev-approuter` is a wrapper for the SAP Application Router, meaning your current (productive) approuter configuration will also work with the `dev-approuter`, with the option to add dev time configuration to it (see [xs-dev.json](#the-xs-devjson-file)).

1. Install the `dev-approuter` as a dev dependency: 
    ```bash
    npm install dev-approuter --save-dev
    ```

2. Add the following script to the `scripts` section of your approuter's `package.json` file:
    ```json
    {
        ...
        "scripts": {
            ...
            "dev": "node node_modules/dev-approuter"
        }
    }
    ```

3. Start the `dev-approuter`:
    ```bash
    npm run dev
    ```

4. The `dev-approuter` starts on port 5000 by default, just like the SAP Application Router. If that port is already in use on your machine (hello Mac users :wave:), you can set another port via the `default-env.json` file:
    ```json
    {
        "PORT": 5001,
        ...
    }
    ```
  ...or by passing a port as environment variable: `PORT=5001 npm run dev`
  
4. Upon start, the `dev-approuter` exposes a custom endpoint `http://localhost:$port/my-jwt`. It echos the current JWT of the current (authenticated and authorized) user (or `none`) - this helps debugging auth(n,z) issues at dev time. 

## Adding and serving apps

To add a UI5 or SAP CDS app to the `dev-approuter`, add it to the `devDependencies` section of your approuter's `package.json` file:

```json
{
    ...
    "devDependencies": {
        ...
        "my-ui5-app": "path/to/ui5-app",
        "my-cds-app": "path/to/cds-app"
    }
}
```

### UI5 apps

For UI5 apps the `metadata.name` (as defined in the `ui5.yaml`) is used as the mount path by default. This can be overwritten with via a `customConfiguration.mountPath` in the `ui5.yaml`:

```yaml
specVersion: "3.0"
metadata:
  name: ui5-app  # default mount path would be /ui5-app 
type: application
customConfiguration:
  cds-plugin-ui5:
    mountPath: /my-custom-mount-path # overwrites the default mount path
```

The above configuration result in the UI5 app being available at `http://localhost:5000/my-custom-mount-path`.

### SAP CDS server

SAP CDS server is started on a separate port (4004 by default, can be overwritten via `CDS_PORT`). The `dev-approuter` automatically creates a route and destination behind the scenes, so that you (and your UI5 apps) can reach your SAP CDS services directly at their service path, but through the `dev-approuter`, e.g. `http://localhost:5000/my-cds-service`.

There is no need manually create a destination for you SAP CDS app, unless you want to overwrite the [default destination configuration](./lib/helpers.js#L81-L85). In this case, create a new destination in a `default-env.json`. The destination's name has to match the module name as declared in the approuter's `devDependencies`:

```json
{
    "CDS_PORT": 4005,
    "destinations": [
        {
            "Name": "my-cds-app",
            "Authentication": "NoAuthentication",
            "ProxyType": "Internet",
            "Type": "HTTP",
            "URL": "http://localhost:4005",
            "forwardAuthToken": true
        }
    ],
    ...
}
```

## The `xs-dev.json` file

The `dev-approuter` introduces the concept of an `xs-dev.json` file, which works like a regular [`xs-app.json`](https://help.sap.com/docs/btp/sap-business-technology-platform/routing-configuration-file) file, but is used by the `dev-approuter` exclusively (meaning it's ignored by the SAP Application Router). The idea behind this concept is to safely separate dev time configuration from productive code.

The `xs-dev.json` follows the same logic and syntax as the [`xs-app.json`](https://help.sap.com/docs/btp/sap-business-technology-platform/routing-configuration-file) file, but has one additional key feature: You can add a `dependency` to a `route`, which links it to a UI5 or SAP CDS app.

Look at the following example `xs-dev.json` that defines different `authenticationType`s for different UI5 apps:

```json
{
    "welcomeFile": "index.html",
    "authenticationMethod": "route",
    "routes": [
        {
            "dependency": "my-ui5-app1",
            "authenticationType": "none"
        },
        {
            "dependency": "my-ui5-app2",
            "authenticationType": "xsuaa"
        }
    ]
}
```

Behind the scenes, the `dev-approuter` will resolve these "dependency routes" by adding the `source`, `target`, and `destination` properties to them. Be aware that exactly these properties get overwritten by the `dev-approuter` in case you use them together with `dependency`. The only exception are SAP CDS dependencies, for which only the `destination` property gets overwritten by the `dev-approuter`.

## Using the `dev-approuter` and SAP Application Router simultaneously

If you choose to place your `dev-approuter` in the same directory as an SAP Application Router, which you will eventually deploy, you will have to remove the `devDependencies` section of the `package.json` before deployment. This is required because the SAP Application Router will not be able to install local dev dependencies (your UI5 and SAP CDS apps) in the cloud. To achieve this, you could introduce a build step for the approuter, moving required files to a `dist/` folder and removing dev dependencies:

```json
"build": "mkdir -p dist && jq 'del(.devDependencies)' package.json > dist/package.json && cp xs-app.json dist/xs-app.json"
```

## Extending the `dev-approuter`

The `dev-approuter` offers an extension point to pass middleware to the SAP Application Router, that gets started by the `dev-approuter` (behind the scenes) and has an extension point of its own (see the [documentation](https://help.sap.com/docs/btp/sap-business-technology-platform/extension-api-of-application-router) for more info). You can use this extension point by passing extensions to the `dev-approuter`'s `start()` method:

```js
const devApprouter = require("dev-approuter/lib/devApprouter");
devApprouter.start([
    {
        insertMiddleware: {
            first: [
                {
                    path: "/my-ext",
                    handler: (req, res, next) => {
                        res.end("Request handled by my extension!")
                    }
                }
            ]
        }
    }
]);
```

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
