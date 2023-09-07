const { Router } = require("express");

/**
 * Creates a patched router removing the mount path
 * from urls and disabling the encoding
 * @returns {Router} patched router
 */
module.exports = async function createPatchedRouter() {
	// create the router and get rid of the mount path
	const router = new Router();
	router.use(function (req, res, next) {
		// disable the compression when livereload is used
		// for loading html-related content (via accept header)
		const accept = req.headers["accept"]?.indexOf("html") !== -1;
		if (accept && res._livereload) {
			req.headers["accept-encoding"] = "identity";
		}
		// store the original request information
		const { url, originalUrl, baseUrl } = req;
		req["cds-plugin-ui5"] = {
			url,
			originalUrl,
			baseUrl,
		};
		// rewite the path to simulate requests on the root level
		req.originalUrl = req.url;
		req.baseUrl = "/";
		// next one!
		next();
	});
	return router;
};
