/* eslint-disable no-unused-vars */
const log = require("@ui5/logger").getLogger("server:custommiddleware:index")

/**
 * serving an html file when "/" is called in the browser,
 * similar to what Apache httpd calls "DirectoryIndex <file>"
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
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {function} Middleware function to use
 */
module.exports = ({ resources, options, middlewareUtil }) => {
	return (req, res, next) => {
		const sIndexFile =
			options.configuration && options.configuration.index ? options.configuration.index : "index.html"
		const reqPath = middlewareUtil.getPathname(req)
		if (reqPath === "/") {
			options && options.configuration && options.configuration.debug ? log.info(`serving ${sIndexFile}!`) : null
			// "redirect" the request
			req.url = `/${sIndexFile}`
			// FTR
			req.path = `/${sIndexFile}`
			req.originalUrl = `/${sIndexFile}`
		}
		next()
	}
}
