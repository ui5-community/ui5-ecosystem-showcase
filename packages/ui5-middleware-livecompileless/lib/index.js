const log = require("@ui5/logger").getLogger("server:custommiddleware:injectless");
const less = require("less-openui5");
const { fsInterface } = require("@ui5/fs");

/**
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ resources, options }) => {
	const isDebug = options.configuration && options.configuration.debug;

	return async function injectLess(req, res, next) {
		let url = req.url;
		if (url.includes(".css") && !url.includes("resources/")) {
			let possibleLessFile = await resources.rootProject.byPath(url.replace(".css", ".less"));
			if (possibleLessFile) {
				isDebug && log.info(`Compiling ${possibleLessFile.getPath()}...`);
				const lessBuilder = new less.Builder({ fs: fsInterface(resources.all) });
				try {
					const output = await lessBuilder.build({
						lessInputPath: possibleLessFile.getPath(),
					});
					res.setHeader("Content-Type", "text/css; charset=utf-8");
					res.send(output.css);
					return;
				} catch (e) {
					log.error(e);
				}
			}
		}
		next();
	};
};
