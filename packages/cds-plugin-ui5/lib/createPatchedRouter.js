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
		const accept = req.headers["accept"]?.indexOf("html");
		if (accept && res._livereload) {
			req.headers["accept-encoding"] = "identity";
		}
		// remove the mount path from the url
		req.originalUrl = req.url;
		req.baseUrl = "/";
		next();
	});
	return router;
};
