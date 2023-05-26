const path = require("path");

const { Router } = require("express");

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
	// do not run the middleware in teh context of the cds-plugin-ui5
	// to avoid cyclic requests between the express middlewares
	if (process.env["cds-plugin-ui5"]) {
		log.info("Skipping middleware as CAP server started the UI5 application!");
	} else {
		// determine the server module id from dependencies if not provided
		const config = options?.configuration || {};
		if (!config.moduleId) {
			// lookup the CAP server from dependencies
			const pkgJson = require(path.join(process.cwd(), "package.json"));
			const deps = [];
			deps.push(...Object.keys(pkgJson.dependencies || {}));
			deps.push(...Object.keys(pkgJson.devDependencies || {}));
			//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
			//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
			const serverDirs = deps.filter((dep) => {
				// either a cds section is in the package.json
				// or the .cdsrc.json exists in the module dir
				try {
					const pkgJson = require(`${dep}/package.json`, {
						paths: [process.cwd()],
					});
					if (!pkgJson.cds) {
						require.resolve(`${dep}/.cdsrc.json`, {
							paths: [process.cwd()],
						});
					}
					return true;
				} catch (e) {
					return false;
				}
			});
			if (serverDirs.length === 1) {
				config.moduleId = serverDirs[0];
			}
		}

		// lookup the server root
		let serverRoot;
		try {
			serverRoot = path.dirname(
				require.resolve(config.moduleId + "/package.json", {
					paths: [process.cwd()],
				})
			);
		} catch (e) {
			log.warn(`Skipping middleware as server with moduleId "${config.moduleId}" cannot be found!`);
		}

		// only run if the server root was found!
		if (serverRoot) {
			// create the Router for the CAP server
			const router = new Router();

			// setup the CAP server
			await applyCAPMiddleware(router, {
				root: serverRoot,
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
