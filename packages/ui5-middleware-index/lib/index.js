/* eslint-disable no-unused-vars */

/**
 * serving an html file when "/" is called in the browser,
 * similar to what Apache httpd calls "DirectoryIndex <file>"
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = ({ log, options, middlewareUtil }) => {
	return (req, res, next) => {
		const sIndexFile = options?.configuration?.welcomeFile || options?.configuration?.index || "index.html"
		const reqPath = middlewareUtil.getPathname(req)
		if (reqPath === "/") {
			options?.configuration?.debug && log.info(`serving ${sIndexFile}!`)
			// "redirect" the request
			req.url = `/${sIndexFile}`
			// FTR
			req.path = `/${sIndexFile}`
			req.originalUrl = `/${sIndexFile}`
			// redirect about original request url
			req["ui5-middleware-index"] = {
				url: reqPath,
				path: reqPath
			}
		}
		next()
	}
}
