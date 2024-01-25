// based on "packages/cds-plugin-ui5/lib/rewriteHTML.js"

const http = require("http");
const HTMLParser = require("node-html-parser");

/**
 * Callback from the `rewriteHTML` function to determine whether the response should be rewritten
 *
 * @callback rewriteCondition
 * @param {http.OutgoingMessage} req http request object
 * @returns {boolean} true, if the response should be rewritten and the `rewriteContent` callback called
 */

/**
 * Callback from the `rewriteHTML` function to modify the HTML document
 *
 * @callback rewriteContent
 * @param {HTMLParser.HTMLElement} doc the HTML document
 * @returns {void}
 */

/**
 * Intercepts the response and calls back the given `rewriteContent` function
 * which could then rewrite the HTML content via the DOM tree.
 *
 * @param {http.OutgoingMessage} req http request object
 * @param {http.IncomingMessage} res http response object
 * @param {rewriteCondition} rewriteCondition function which is called to determine whether the response should be rewritten
 * @param {rewriteContent} rewriteContent function to be called to modify the HTML document
 * @returns {void}
 */
module.exports = async function rewriteHTML(req, res, rewriteCondition, rewriteContent) {
	// rewriteCondition and rewriteContent function must be available
	if (typeof rewriteCondition !== "function" && typeof rewriteContent !== "function") {
		return;
	}

	// disable the compression for loading html-related content (via accept header)
	const accept = req.headers["accept"]?.indexOf("html") !== -1;
	if (accept) {
		req.headers["accept-encoding"] = "identity";
	}

	// store the references to the origin response methods
	const { writeHead, end } = res;

	// buffer to store the received content in
	const contentBuffer = [];

	// remove the content-length and etag header / disable caching
	res.writeHead = function () {
		if (res.statusCode !== 200 || !rewriteCondition(res)) return writeHead.apply(this, arguments);
		res.removeHeader("content-length");
		res.removeHeader("etag");
		res.setHeader("cache-control", "no-cache");
		return writeHead.apply(this, arguments);
	};

	// intercepts the response end to parse the HTML content
	res.end = function (content, encoding) {
		if (res.statusCode !== 200 || !rewriteCondition(res)) return end.apply(this, arguments);

		// store the last chunk in the content buffer
		contentBuffer.push(content instanceof Buffer ? content.toString(encoding) : content);

		// create the html content
		let htmlContent = contentBuffer.join("");

		// ensure that the request is rewritten only once and not also by the cds-plugin-ui5
		// therefore we add a marker to the request so that the middlewares can identify this
		if (!req["ui5-rewriteHTML"]) {
			// parse the html content
			const doc = HTMLParser.parse(htmlContent);

			// now run the callback
			rewriteContent(doc);

			// update the html content
			htmlContent = doc.toString();
		}
		req["ui5-rewriteHTML"] = true;

		// the rest is on express
		end.call(res, htmlContent, encoding);
	};
};
