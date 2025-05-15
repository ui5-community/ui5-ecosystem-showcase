const approuter = require("@sap/approuter");
const express = require("express");
const xsenv = require("@sap/xsenv");

const findUI5Modules = require("cds-plugin-ui5/lib/findUI5Modules");
const createPatchedRouter = require("cds-plugin-ui5/lib/createPatchedRouter");
const applyUI5Middleware = require("cds-plugin-ui5/lib/applyUI5Middleware");
const findCDSModules = require("ui5-middleware-cap/lib/findCDSModules");
const applyCDSMiddleware = require("ui5-middleware-cap/lib/applyCDSMiddleware");

const { LOG, parseConfig, applyDependencyConfig, addDestination, configureCDSRoute, configureUI5Route } = require("./helpers");

// marker that the dev-approuter is running
process.env["dev-approuter"] = true;

class DevApprouter {
	constructor() {}

	/**
	 * Starts the dev approuter.
	 * Extensions passed as argument are handed to the SAP Approuter without modifications.
	 * We suggest to check the documentation (link below) for an extensive read on how the dev approuter works.
	 * Here is a shorter summary:
	 * UI5 modules declared as (dev)dependencies are added as extensions
	 * using the extension API of the SAP Approuter.
	 * CDS modules declared as (dev)dependencies are started on a different port.
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
		const arPort = process.env.PORT || 5000;
		const cdsPort = process.env.CDS_PORT || 4004;

		// lookup the CDS server root
		let cdsServerConfig;
		const cdsModules = await findCDSModules({ cwd });
		if (cdsModules.length > 1) {
			throw new Error(`Multiple CDS modules found. The package dev-approuter can only handle one CDS module as dependency.`);
		} else if (cdsModules.length === 1) {
			cdsServerConfig = cdsModules[0];
		}

		// find all UI5 modules from the CDS server root and dependencies from the approuter
		const ui5Modules = [];
		let ui5ModulesConfig = {};
		const approuterUI5Modules = await findUI5Modules({ cwd, skipLocalApps: true });
		ui5Modules.push(...(approuterUI5Modules || []));
		const { config: approuterUI5ModulesConfig } = approuterUI5Modules;
		ui5ModulesConfig = Object.assign(ui5ModulesConfig, approuterUI5ModulesConfig);
		//const ui5Modules = [...(await findUI5Modules({ cwd, skipLocalApps: true }))];
		if (cdsServerConfig) {
			const cdsUI5Modules = await findUI5Modules({ cwd: cdsServerConfig.modulePath, skipDeps: true });
			ui5Modules.push(...(cdsUI5Modules || []));
			const { config: cdsUI5ModulesConfig } = cdsUI5Modules;
			ui5ModulesConfig = Object.assign(ui5ModulesConfig, cdsUI5ModulesConfig);
			//ui5Modules.push(...(await findUI5Modules({ cwd: cdsServerConfig.modulePath, skipDeps: true })));
		}

		// collect UI5 middlewares
		const ui5Middlewares = [];
		for await (const ui5Module of ui5Modules) {
			const { moduleId, modulePath, mountPath } = ui5Module;

			// create a patched router
			const router = await createPatchedRouter();

			// apply the UI5 middlewares to the router
			await applyUI5Middleware(router, {
				cwd,
				basePath: modulePath,
				...(ui5ModulesConfig[moduleId] || {}),
			});

			// mounting the router for the UI5 application to the CDS server
			LOG.info(`Mounting ${mountPath} to UI5 app ${modulePath}`);

			let middlewareMountPath;
			// define middlewareMountPath as `/_${mountPath}` if ui5 module is referenced as "dependency" in xs-dev.json or xs-app.json
			if (config.dependencyRoutes && config.dependencyRoutes[moduleId]) {
				// configure UI5 route
				config.dependencyRoutes[moduleId] = configureUI5Route(moduleId, mountPath, config.dependencyRoutes[moduleId]);

				middlewareMountPath = "/_" + mountPath;

				// add destination for newly configured route
				addDestination(moduleId, arPort, middlewareMountPath);
			} else {
				middlewareMountPath = mountPath;
			}

			// store the router for later registration
			ui5Middlewares.push({
				path: middlewareMountPath,
				handler: router,
			});
		}

		// start CDS server on different port
		if (cdsServerConfig) {
			const { modulePath, moduleId } = cdsServerConfig;

			// start CDS server on different port (requires to override the
			// origin listen function to intercept call from CDS server and
			// ensure to use the port as defined by environment variable or
			// the default port for the CDS server!)
			const app = express();
			app._listen = app.listen;
			app.listen = function (port, callback) {
				return this._listen(cdsPort, function () {
					LOG.info(`CDS server started at: http://localhost:${cdsPort}`);
					callback?.apply(callback, arguments);
				});
			};

			// apply the CDS server middlewares and keep the welcome page
			const { servicesPaths } = await applyCDSMiddleware(app, {
				root: modulePath,
				options: config.dependencyRoutes[moduleId]?.options,
				headless: false,
			});

			// create route if CDS module is not referenced in xs-dev.json/xs-app.json
			if (!config.dependencyRoutes[moduleId]) {
				const route = {
					dependency: moduleId,
					authenticationType: "none",
				};
				// respect already declared routes in xs-dev.json
				// so inserting these auto-generated ones after
				config.routes.push(Object.assign({}, route));
				config.dependencyRoutes[moduleId] = configureCDSRoute(moduleId, servicesPaths, route);
			} else {
				config.dependencyRoutes[moduleId] = configureCDSRoute(moduleId, servicesPaths, config.dependencyRoutes[moduleId]);
			}

			// add destination for newly configured route
			addDestination(moduleId, cdsPort);
		}

		// create and start the SAP Approuter
		// https://help.sap.com/docs/btp/sap-business-technology-platform/extension-api-of-application-router
		const _approuter = approuter();
		// helper: if used in a hybrid setup w/ xsuaa,
		// this endpoint helps to debug auth(n,z) issues
		// DANGER, WILL SMITH: you must not use this in production envs!
		_approuter.beforeRequestHandler.use("/my-jwt", (req, res) => {
			res.end(req.session?.user?.token?.accessToken || "none");
		});
		_approuter.start({
			port: arPort,
			xsappConfig: applyDependencyConfig(config),
			extensions: [
				{
					insertMiddleware: {
						first: ui5Middlewares,
					},
				},
			].concat(extensions),
		});
		LOG.info(`Approuter started at: http://localhost:${arPort}`);
	}
}

module.exports = new DevApprouter();
