const LessBuilder = require("./LessBuilder");

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
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, resources, options, middlewareUtil }) => {
	const isDebug = options?.configuration?.debug;

	return async function less(req, res, next) {
		const pathname = req.url?.match("^[^?]*")[0];
		if (pathname.endsWith(".css")) {
			let possibleLessFile = await resources.rootProject.byPath(pathname.replace(".css", ".less"));
			if (possibleLessFile) {
				isDebug && log.info(`Compiling ${possibleLessFile.getPath()}...`);
				const lessBuilder = await LessBuilder.create(resources.all);
				try {
					const output = await lessBuilder.build(possibleLessFile);
					let { contentType /*, charset */ } = middlewareUtil.getMimeInfo(".css");
					res.setHeader("Content-Type", contentType);
					res.end(output.css);
				} catch (err) {
					res.status(500);
					log.error(`${err.message}\n${JSON.stringify(err, undefined, 2)}`);
					res.end(`${err.message} in resource "${err.filename}"`);
				}
				return;
			}
		}
		next();
	};
};
