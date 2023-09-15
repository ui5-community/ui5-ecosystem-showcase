const path = require("path");

const { Router } = require("express");

const findCDSModules = require("./findCDSModules");
const applyCDSMiddleware = require("./applyCDSMiddleware");

/**
 * Custom UI5 Server middleware for CDS
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
		log.info("Skip middleware as the UI5 application has been started embedded in the CDS server!");
	} else {
		// marker that the ui5-middleware-cap is running
		process.env["ui5-middleware-cap"] = true;

		const cwd = process.cwd();
		const config = options?.configuration || {};

		let cdsModule;
		if (config.moduleId) {
			// lookup the configured server module
			try {
				cdsModule = {
					moduleId: config.moduleId,
					modulePath: path.dirname(
						require.resolve(`${config.moduleId}/package.json`, {
							paths: [cwd],
						})
					),
				};
			} catch (e) {
				log.warn(`Skipping middleware as CDS server module "${config.moduleId}" cannot be found!`);
			}
		} else {
			// determine the server module id from dependencies if not provided
			const cdsModules = await findCDSModules({ cwd });
			if (cdsModules.length === 1) {
				cdsModule = cdsModules[0];
				log.info(`Found CDS server module "${cdsModule.moduleId}"!`);
			}
		}

		// only run if the server root was found!
		if (cdsModule) {
			// create the Router for the CDS server
			const router = new Router();

			// setup the CDS server
			await applyCDSMiddleware(router, {
				root: cdsModule.modulePath,
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
