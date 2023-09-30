const { Router } = require("express");
const rewriteHTML = require("./rewriteHTML");

/**
 * Creates a patched router removing the mount path
 * from urls and disabling the encoding
 * @returns {Router} patched router
 */
module.exports = async function createPatchedRouter() {
	// create the router and get rid of the mount path
	const router = new Router();
	router.use(function (req, res, next) {
		// store the original request information
		const { url, originalUrl, baseUrl } = req;
		req["ui5-patched-router"] = req["ui5-patched-router"] || {
			url,
			originalUrl,
			baseUrl,
		};
		// rewite the path to simulate requests on the root level
		req.originalUrl = req.url;
		req.baseUrl = "/";
		// disable the compression when livereload is used
		// for loading html-related content (via accept header)
		// otherwise we run into compression issue with CDS livereload
		const accept = req.headers["accept"]?.indexOf("html") !== -1;
		if (accept && res._livereload) {
			req.headers["accept-encoding"] = "identity";
		}
		// override UI5 server directory listing if:
		//   1.) not handled by the CDS Plugin UI5 already
		//   2.) only if it ends with a slash
		//   3.) not forwarded to a welcome page
		if (!req._cds_plugin_ui5 && req.url?.endsWith("/") && req.url === (req?.["ui5-middleware-index"]?.url || req.url)) {
			// determine context path (approuter contains x-forwarded-path header)
			let contextPath = baseUrl;
			if (req.headers["x-forwarded-path"]) {
				// determine the context path by removing the subpath from the forwarded path
				contextPath = req.headers["x-forwarded-path"].slice(0, -1 * url.length);
			} else if (req["ui5-patched-router"].originalUrl) {
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
					if (title) {
						title.innerHTML = `Index of ${contextPath}/`;
					}
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
			);
		}
		// next one!
		next();
	});
	return router;
};
