const hook = require("ui5-middleware-websocket/lib/hook");
const findUI5Modules = require("./findUI5Modules");
const applyUI5Middleware = require("./applyUI5Middleware");
const createPatchedRouter = require("./createPatchedRouter");

/**
 * include and serve UI5 application dependencies
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options }) => {
	// do not run the middleware in the context of the cds-plugin-ui5
	// to avoid cyclic requests between the express middlewares
	if (process.env["cds-plugin-ui5"]) {
		log.info("Skip middleware as the UI5 application has been started embedded in the CDS server!");
	} else {
		const cwd = process.cwd();
		const config = options.configuration;
		return hook(
			"ui5-middleware-ui5",
			async ({ app }) => {
				const ui5Modules = await findUI5Modules({
					cwd,
					log,
					config,
				});
				for await (const ui5Module of ui5Modules) {
					const { moduleId, mountPath, modulePath } = ui5Module;
					const options = config?.modules?.[moduleId];

					// mounting the Router for the UI5 application to the CDS server
					log.info(`Mounting ${mountPath} to UI5 app ${modulePath} (id=${moduleId})${options ? ` using options=${JSON.stringify(options)}` : ""}`);

					const router = await createPatchedRouter();
					await applyUI5Middleware(router, {
						cwd,
						basePath: modulePath,
						...(options || {}),
					});
					app.use(mountPath, router);
				}
			},
			function (req, res, next) {
				/* dummy middleware function */ next();
			}
		);
	}

	// in any case, at least register a dummy middleware function
	return async function (req, res, next) {
		/* dummy middleware function */ next();
	};
};
