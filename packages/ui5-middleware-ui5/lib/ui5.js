const path = require("path");

const hook = require("ui5-utils-express/lib/hook");
const findUI5Modules = require("./findUI5Modules");
const applyUI5Middleware = require("./applyUI5Middleware");
const createPatchedRouter = require("./createPatchedRouter");

/**
 * include and serve UI5 application dependencies
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a MiddlewareUtil instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options, middlewareUtil }) => {
	const cwd = middlewareUtil.getProject().getRootPath() || process.cwd();
	// determine the effective configuration
	const config = Object.assign(
		{},
		{
			debug: false,
			serveFromNamespace: true,
			modules: {},
		},
		options?.configuration
	);

	return hook("ui5-middleware-ui5", async ({ use, options }) => {
		const ui5Modules = await findUI5Modules({
			cwd,
			log,
			config,
		});
		const mwMountPath = options?.mountpath || "/";
		for await (const ui5Module of ui5Modules) {
			const { moduleId, mountPath, modulePath } = ui5Module;
			const options = config?.modules?.[moduleId];

			const absMountPath = path.join(mwMountPath, mountPath);

			// mounting the Router for the UI5 application to the CDS server
			log.info(`Mounting ${absMountPath} to UI5 app ${modulePath} (id=${moduleId})${options ? ` using options=${JSON.stringify(options)}` : ""}`);

			const router = await createPatchedRouter();
			await applyUI5Middleware(router, {
				cwd,
				basePath: modulePath,
				...(options || {}),
			});
			use(absMountPath, router);
		}
	});
};
