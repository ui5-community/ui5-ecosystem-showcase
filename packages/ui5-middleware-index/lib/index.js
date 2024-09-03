/**
 * serving an html file when "/" is called in the browser,
 * similar to what Apache httpd calls "DirectoryIndex <file>"
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = ({ log, options }) => {
	return (req, res, next) => {
		const sIndexFile = options?.configuration?.welcomeFile || options?.configuration?.index || "index.html"
		const { url, originalUrl } = req
		if (req.path === "/") {
			options?.configuration?.debug && log.info(`serving ${sIndexFile}!`)
			// "redirect" the request
			req.url = `/${sIndexFile}${req.url.substring(1)}`
			req.originalUrl = req.url
			// redirect about original request url
			req["ui5-middleware-index"] = {
				url,
				originalUrl
			}
		}
		next()
	}
}
