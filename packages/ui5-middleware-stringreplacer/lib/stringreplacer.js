const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-middleware-stringreplacer");

/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({ resources, options }) {
	return (req, res, next) => {

		let includePatterns = [];
		if (options.configuration && options.configuration.includePatterns) {
			if (Array.isArray(options.configuration.includePatterns)) {
				includePatterns = options.configuration.includePatterns;
			} else {
				includePatterns.push(options.configuration.includePatterns);
			}
		}

		if (!(includePatterns).some((pattern) =>
			req.path.includes(pattern)
		)) {
			next();
			return;
		}

		options.configuration && options.configuration.debug && log.info(`handling ${req.path}`)

		return resources.rootProject.byPath(req.path).then(async (resource) => {
			if (!resource) {
				// No file found, hand over to next middleware
				next();
				return;
			}
			const buffer = await resource.getBuffer();
			let text = buffer.toString();

			const replace = options.configuration.replace;
			for (let i = 0; i < replace.length; i++) {
				text = text.replace(replace[i].placeholder, replace[i].value);
			}
			res.end(text);
		}).catch((err) => {
			next(err);
		});

	}
}
