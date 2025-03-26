const { Router } = require("express");
const rewriteHTML = require("./rewriteHTML");

/**
 * Creates a patched router removing the mount path
 * from urls and disabling the encoding
 * @param {string} mountPath mount path of module
 * @param {(router: Router) => Promise<void>} [lazyMiddlewareLoader] (optional) function to load the missing middlewares
 * @returns {Router} patched router
 */
module.exports = function createPatchedRouter(mountPath, lazyMiddlewareLoader) {
	// create the router and get rid of the mount path
	const router = new Router();
	let middlewaresLoaded = lazyMiddlewareLoader === undefined;
	router.use(async function (req, res, next) {
		// store the original request information
		const { url, originalUrl, baseUrl } = req;
		if (!middlewaresLoaded) {
			await lazyMiddlewareLoader(router);
			middlewaresLoaded = true;
		}
		req["ui5-patched-router"] = req["ui5-patched-router"] || {
			url,
			originalUrl,
			baseUrl,
		};
		// rewite the path to simulate requests on the root level
		req.originalUrl = req.url;
		req.baseUrl = "/";
		// only accept requests for html-related content (via accept header)
		const accept = req.headers["accept"]?.indexOf("html") !== -1;
		// disable the compression when livereload is used
		// for loading html-related content (via accept header)
		// otherwise we run into compression issue with CDS livereload
		if (accept && res._livereload) {
			req.headers["accept-encoding"] = "identity";
		}
		// override UI5 server directory listing if not forwarded to a welcome page
		// and not already handled by the HTML rewriter of the CDS welcome page
		if (accept && !req._cds_plugin_ui5 && req.url === (req["ui5-middleware-index"]?.url || req.url)) {
			// determine context path (approuter contains x-forwarded-path header)
			let contextPath = baseUrl;
			if (req.headers["x-forwarded-path"]?.endsWith(url)) {
				// determine the context path by removing the subpath from the forwarded path
				contextPath = req.headers["x-forwarded-path"].slice(0, -1 * url.length);
			} else if (req["ui5-patched-router"].originalUrl?.endsWith(url)) {
				// determine the context path by removing the subpath from the originalUrl
				contextPath = req["ui5-patched-router"].originalUrl.slice(0, -1 * url.length);
			}
			rewriteHTML(
				req,
				res,
				(res) => {
					const contentType = res.getHeader("content-type");
					return contentType?.indexOf("text/html") !== -1;
				},
				(doc) => {
					const title = doc.getElementsByTagName("title")?.[0];
					if (title && title.innerHTML.startsWith(`Index of ${req.url}`)) {
						title.innerHTML = `Index of ${contextPath}/`;
						const files = doc.getElementById("files");
						const filesas = files?.getElementsByTagName("a");
						filesas?.forEach((a) => {
							a.setAttribute("href", `${contextPath}${a.getAttribute("href")}`);
						});
						const h1 = doc.getElementsByTagName("h1")?.[0];
						const h1as = h1?.getElementsByTagName("a");
						h1as?.forEach((a) => {
							const path = a.getAttribute("href") === "/" ? "/" : a.getAttribute("href") + "/";
							a.setAttribute("href", `${contextPath}${path}`);
						});
						h1?.insertAdjacentHTML("afterbegin", `<a href="/">🏡</a> / `);
					}
				},
			);
		}
		// next one!
		next();
	});
	return router;
};
