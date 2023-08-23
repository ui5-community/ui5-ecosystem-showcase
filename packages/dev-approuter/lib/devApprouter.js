const approuter = require("@sap/approuter");
const express = require("express");
const xsenv = require('@sap/xsenv')

const findUI5Modules = require("cds-plugin-ui5/lib/findUI5Modules");
const createPatchedRouter = require("cds-plugin-ui5/lib/createPatchedRouter");
const applyUI5Middleware = require("cds-plugin-ui5/lib/applyUI5Middleware");

const findCAPModules = require("ui5-middleware-cap/lib/findCAPModules");
const applyCAPMiddleware = require("ui5-middleware-cap/lib/applyCAPMiddleware");

const {
    parseConfig,
    applyDependencyConfig,
    addDestination,
    configureCAPRoute,
    configureUI5Route
} = require("./helpers");


class DevApprouter {

    constructor() {}

    /**
     * Starts the dev approuter.
     * Extensions passed as argument are handed to the SAP Approuter without modifications.
     * We suggest to check the documentation (link below) for an extensive read on how the dev approuter works.
     * Here is a shorter summary:
     * UI5 modules declared as (dev)dependencies are added as extensions
     * using the extension API of the SAP Approuter.
     * CAP modules declared as (dev)dependencies are started on a different port.
     * Corresponding routes and destinations are automatically created.
     * A custom `xs-dev.json` can be used to configure the dev approuter,
     * so the productive configuration can be kept in the `xs-app.json`.
     * @param {Object[]} [extensions] - an optional array of extensions that are handed to the SAP Approuter without modification.
     * @param {Object} extensions[].insertMiddleware - an object containing the middlewares.
     * @param {Object[]} extensions[].insertMiddleware.first - an array of middlewares to be inserted in the `first` slot.
     * @param {String} extensions[].insertMiddleware.first[].path - a string representing the path to handle requests for.
     * @param {Function} extensions[].insertMiddleware.first[].handler - a function handling `(req, res, next)`.
     * @param {Object[]} extensions[].insertMiddleware.beforeRequestHandler - an array of middlewares to be inserted in the `beforeRequestHandler` slot.
     * @param {String} extensions[].insertMiddleware.beforeRequestHandler[].path - a string representing the path to handle requests for.
     * @param {Function} extensions[].insertMiddleware.beforeRequestHandler[].handler - a function handling `(req, res, next)`.
     * @param {Object[]} extensions[].insertMiddleware.beforeErrorHandler - an array of middlewares to be inserted in the `beforeErrorHandler` slot.
     * @param {String} extensions[].insertMiddleware.beforeErrorHandler[].path - a string representing the path to handle requests for.
     * @param {Function} extensions[].insertMiddleware.beforeErrorHandler[].handler - a function handling `(req, res, next)`.
     * @see https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/dev-approuter
     */
    async start(extensions = []) {
        // loads env from default-env.json
        xsenv.loadEnv();

        const config = parseConfig();
        const cwd = process.cwd();

        // lookup the CAP server root
        let capServerConfig;
        const capModules = await findCAPModules({ cwd });
        if (capModules.length > 1) {
            throw new Error(`Multiple CAP modules found. The package dev-approuter can only handle one CAP module as dependency.`);
        } else if (capModules.length === 1) {
            capServerConfig = capModules[0];
        }

        // find all UI5 modules from the CAP server root and dependencies from the approuter
        const ui5Modules = [...(await findUI5Modules({ cwd, skipLocalApps: true }))];
        if (capServerConfig) {
            ui5Modules.push(...(await findUI5Modules({ cwd: capServerConfig.modulePath, skipDeps: true })))
        }

        // collect UI5 middlewares
        const ui5Middlewares = [];
        for await (const ui5Module of ui5Modules) {
            const { moduleId, modulePath, mountPath } = ui5Module;

            // create a patched router
            const router = await createPatchedRouter();

            // apply the UI5 middlewares to the router
            await applyUI5Middleware(router, {
                basePath: modulePath,
                configPath: modulePath,
            });

            // mounting the router for the UI5 application to the CAP server
            console.log(`Mounting ${mountPath} to UI5 app ${modulePath}`);

            let middlewareMountPath
            // define middlewareMountPath as `/_${mountPath}` if ui5 module is referenced as "dependency" in xs-dev.json or xs-app.json
            if (config.dependencyRoutes && config.dependencyRoutes[moduleId]) {
                // configure UI5 route
                config.dependencyRoutes[moduleId] = configureUI5Route(moduleId, mountPath, config.dependencyRoutes[moduleId]);

                middlewareMountPath = "/_" + mountPath;

                // add destination for newly configured route
                addDestination(moduleId, process.env.PORT, middlewareMountPath);
            } else {
                middlewareMountPath = mountPath;
            }

            // store the router for later registration
            ui5Middlewares.push({
                path: middlewareMountPath,
                handler: router
            });

        }

        // start CAP server on different port
        if (capServerConfig) {
            const { modulePath, moduleId } = capServerConfig;

            // start CAP server on different port
            const app = express();
            const { servicesPaths } = await applyCAPMiddleware(app, { root: modulePath, cwd });
            app.listen(process.env.CAP_PORT || 4004, () => {
                console.log(`CAP server started at: http://localhost:${process.env.CAP_PORT || 4004}`);
            });

            // configure CAP route if referenced as "dependency" in xs-dev.json/xs-app.json
            if (config.dependencyRoutes && config.dependencyRoutes[moduleId]) {
                config.dependencyRoutes[moduleId] = configureCAPRoute(moduleId, servicesPaths, config.dependencyRoutes[moduleId]);
            }

            // add destination for newly configured route
            addDestination(moduleId, process.env.CAP_PORT || 4004);
        }

        // create and start the SAP Approuter
        // https://help.sap.com/docs/btp/sap-business-technology-platform/extension-api-of-application-router
        approuter().start({
            port: process.env.PORT || 5001,
            xsappConfig: applyDependencyConfig(config),
            extensions: [
                {
                    insertMiddleware: {
                        first: ui5Middlewares
                    }
                }
            ].concat(extensions)
        });
        console.log(`Approuter started at: http://localhost:${process.env.PORT || 5001}`);
    };
}

module.exports = new DevApprouter();