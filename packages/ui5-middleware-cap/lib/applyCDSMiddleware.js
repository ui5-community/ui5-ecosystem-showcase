/**
 * @typedef CDSServerInfo
 * @type {object}
 * @property {Array<string>} servicePaths list of paths of available app services
 */

// inspired by https://cap.cloud.sap/docs/node.js/cds-serve
/**
 * Applies the middlewares for the CDS server located in the given
 * root directory to the given router (or express application - but
 * keep in mind that the CDS serve calls app.listen!).
 * @param {import("express").Router} router Express Router instance
 * @param {object} params parameters
 * @param {string} params.root root directory of the CDS server
 * @param {string} params.options options of the CDS server (overrules the default options)
 * @param {string} params.headless flag whether the CDS server should run in headless mode (no welcome page!)
 * @returns {CDSServerInfo} CDS server information
 */
module.exports = async function applyCDSMiddleware(
	router,
	{
		root,
		options = {
			"in-memory?": true,
			"with-mocks": true,
		},
		headless = true,
	}
) {
	// store the cwd to restore after the CDS server started
	const cwd = process.cwd();

	// require the CDS serve function (relative to the server root!)
	const serve = require(require.resolve("@sap/cds/bin/serve", {
		paths: [root],
	}));

	// start the CDS server
	await serve(
		[root],
		Object.assign(
			{},
			options,
			{
				app: router,
				project: root,
				livereload: false,
			},
			headless
				? {
						static: false,
						favicon: false,
						index: false,
				  }
				: {}
		)
	);

	// require the CDS server module (relative to the server root!)
	const cdsModule = require.resolve("@sap/cds", {
		paths: [root],
	});
	const cds = require(cdsModule);

	// extract the "odata-v4" service paths from cds services
	const servicesPaths = [];
	Object.keys(cds.services)
		.filter((service) => Array.isArray(cds.services[service].endpoints))
		.forEach((service) => servicesPaths.push(...cds.services[service].endpoints.filter((endpoint) => endpoint.kind === "odata-v4").map((endpoint) => endpoint.path)));

	// change dir back (only needed temporary for cds bootstrap)
	process.chdir(cwd);

	// return the CDS server information
	return { servicesPaths };
};
