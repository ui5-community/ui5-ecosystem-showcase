const less = require("less-openui5");

/**
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
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
module.exports = async ({ log, resources, options }) => {
	const isDebug = options?.configuration?.debug;

	return async function injectLess(req, res, next) {
		let url = req.url;
		if (url.includes(".css") && !url.includes("resources/")) {
			// in case of livereload a `?livereload=<timestamp>` will be appended
			let lessUrl = url.replace(".css", ".less");
			if (lessUrl.includes("?")) {
				lessUrl = lessUrl.substr(0, lessUrl.indexOf("?"));
			}

			let possibleLessFile = await resources.rootProject.byPath(lessUrl);
			if (possibleLessFile) {
				isDebug && log.info(`Compiling ${possibleLessFile.getPath()}...`);
				const { default: fsInterface } = await import("@ui5/fs/fsInterface");
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
