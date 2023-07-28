const path = require("path");

const { Router } = require("express");

const findCAPModules = require("./findCAPModules");
const applyCAPMiddleware = require("./applyCAPMiddleware");

/**
 * Custom UI5 Server middleware for CAP
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance for use in the custom middleware
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options }) => {
	// do not run the middleware in the context of the cds-plugin-ui5
	// to avoid cyclic requests between the express middlewares
	if (process.env["cds-plugin-ui5"]) {
		log.info("Skipping middleware as CAP server started the UI5 application!");
	} else {
		const cwd = process.cwd();
		const config = options?.configuration || {};

		let capModule;
		if (config.moduleId) {
			// lookup the configured server module
			try {
				capModule = {
					moduleId: config.moduleId,
					modulePath: path.dirname(
						require.resolve(`${config.moduleId}/package.json`, {
							paths: [cwd],
						})
					),
				};
			} catch (e) {
				log.warn(`Skipping middleware as server module "${config.moduleId}" cannot be found!`);
			}
		} else {
			// determine the server module id from dependencies if not provided
			const capModules = await findCAPModules({ cwd });
			if (capModules.length === 1) {
				capModule = capModules[0];
				log.info(`Found server module "${capModule.moduleId}"!`);
			}
		}

		// only run if the server root was found!
		if (capModule) {
			// create the Router for the CAP server
			const router = new Router();

			// setup the CAP server
			await applyCAPMiddleware(router, {
				root: capModule.modulePath,
			});

			// attach the router to the UI5 server
			return router;
		}
	}

	// in any case, at least register a dummy middleware function
	return async function (req, res, next) {
		/* dummy middleware function */ next();
	};
};
