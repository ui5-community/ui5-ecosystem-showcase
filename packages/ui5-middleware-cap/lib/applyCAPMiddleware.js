const path = require("path");
const fs = require("fs");

/**
 * @typedef CAPServerInfo
 * @type {object}
 * @property {Array<string>} servicePaths list of paths of available app services
 */

// inspired by https://cap.cloud.sap/docs/node.js/cds-serve
/**
 * Applies the middlewares for the CAP server located in the given
 * root directory to the given router.
 * @param {import("express").Router} router Express Router instance
 * @param {object} options configuration options
 * @param {string} options.root root directory of the CAP server
 * @returns {CAPServerInfo} CAP server information
 */
module.exports = async function applyCAPMiddleware(router, { root }) {
	const options = Object.assign(
		{
			in_memory: true,
			from: "*",
			service: "all",
		},
		{
			root,
		}
	);

	// change dir for cds bootstrap
	const cwd = process.cwd();
	process.chdir(options.root);

	// require the CAP server module (locally from the server root!)
	const cdsModule = require.resolve("@sap/cds", {
		paths: [options.root],
	});
	const cds = require(cdsModule);

	// load the package.json for additional metadata
	const pkgJson = require(path.join(options.root, "package.json"));

	// rebuild the same logic as in @sap/cds/bin/server.js:
	//   * load custom server if exists (to attach hooks)
	//   * find and register plugins (for extensions)
	//   ==> ASK: helper to start the server with all configs
	//let serverModuleId = "@sap/cds";
	if (fs.existsSync(path.join(options.root, "server.js"))) {
		require(path.join(options.root, "server.js"));
	}
	// here we by intention only use the dependencies and not the
	// devDependencies as we want to simulate the later runtime
	Object.keys(pkgJson?.dependencies || {})
		.map((dep) => {
			try {
				return require.resolve(path.join(dep, "cds-plugin"), {
					paths: [options.root],
				});
			} catch (e) {
				/* undefined */
			}
		})
		.filter((dep) => dep !== undefined);

	cds.emit("bootstrap", router);

	// load model from all sources
	const csn = await cds.load(options.from || "*", options);
	cds.model = cds.compile.for.nodejs(csn);
	cds.emit("loaded", cds.model);

	// bootstrap in-memory db
	// eslint-disable-next-line jsdoc/require-jsdoc
	async function _init(db) {
		if (!options.in_memory || cds.requires.multitenancy) return db;
		const fts = cds.requires.toggles && cds.resolve(cds.features.folders);
		const m = !fts ? csn : await cds.load([options.from || "*", ...fts], options).then(cds.minify);
		return cds.deploy(m).to(db, options);
	}

	// connect to prominent required services
	if (cds.requires.db) cds.db = await cds.connect.to("db").then(_init);
	if (cds.requires.messaging) await cds.connect.to("messaging");

	// serve own services as declared in model
	await cds.serve(options).from(csn).in(router);
	await cds.emit("served", cds.services);

	// extract the "odata-v4" service paths from cds services
	const servicesPaths = [];
	Object.keys(cds.services)
		.filter((service) => Array.isArray(cds.services[service].endpoints))
		.forEach((service) => servicesPaths.push(...cds.services[service].endpoints.filter((endpoint) => endpoint.kind === "odata-v4").map((endpoint) => endpoint.path)));

	// change dir back (only needed temporary for cds bootstrap)
	process.chdir(cwd);

	// return the CAP server information
	return { servicesPaths };
};
