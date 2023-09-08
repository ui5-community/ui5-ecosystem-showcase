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
		// try to override UI5 tooling directory listing
		if (req.url?.endsWith("/")) {
			const end = res.end;
			res.end = function (content) {
				const contentType = res.getHeader("content-type");
				if (content && contentType?.indexOf("text/html") !== -1) {
					const HTMLParser = require("node-html-parser");
					const doc = new HTMLParser.parse(content);
					const title = doc.getElementsByTagName("title")?.[0];
					if (title) {
						title.innerHTML = `Index of ${baseUrl}/`;
					}
					const as = doc.getElementsByTagName("a");
					as?.forEach((a) => {
						a.setAttribute("href", `${baseUrl}${a.getAttribute("href")}`);
					});
					const h1 = doc.getElementsByTagName("h1")?.[0];
					h1?.insertAdjacentHTML("afterbegin", `<a href="/">@sap/cds</a> &gt; `);
					content = doc.toString();
				}
				end.apply(res, arguments);
			};
		}
		// next one!
		next();
	});
	return router;
};
