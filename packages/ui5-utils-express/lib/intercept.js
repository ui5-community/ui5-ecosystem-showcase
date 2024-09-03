// eslint-disable-next-line no-unused-vars
const http = require("http"); // needed for JSDoc

/**
 * Async callback function to determine whether the response should be intercepted
 *
 * @callback ConditionCallback
 * @param {http.OutgoingMessage} req http request object
 * @returns {Promise<boolean>} true, if the response should be intercepted and the `intercept` callback called
 */

/**
 * Async callback function to allow intercepting the response body and rewrite it
 *
 * @callback InterceptCallback
 * @param {string} body the reponse body
 * @param {string} encoding rthe response body encoding
 * @param {http.OutgoingMessage} req http request object
 * @returns {Promise<string|undefined>}
 */

/**
 * This function installs an express app-like middleware function
 * to get access to the express app and intercepts the listen function
 * to get access to the server instance.
 *
 * @param {string} name Name of the middleware function
 * @param {ConditionCallback} condition Async callback function to determine whether the response should be intercepted
 * @param {InterceptCallback} intercept Async callback function to allow intercepting the response body and rewrite it
 * @returns {Function} Middleware function to use
 */
module.exports = function intercept(name, condition, intercept) {
	// default the name
	name = name || "<anonymous_interceptor>";
	const fn = async function (req, res, next) {
		if (typeof condition === "function" && (await condition(req))) {
			// store the references to the origin response methods
			const { writeHead, write, end } = res;

			// disable compression to allow proper rewrite of the content
			req.headers["accept-encoding"] = "identity";

			// only 2xx responses should be handled
			const shouldHandleResponse = function shouldHandleResponse(res) {
				return res.statusCode >= 200 && res.statusCode < 300;
			};

			// disable the response headers for the content-length which will change
			// anyhow when modifying the content and disable caching...
			res.writeHead = function interceptWriteHead() {
				if (!shouldHandleResponse(res)) return writeHead.apply(this, arguments);
				res.removeHeader("content-length");
				res.removeHeader("etag");
				res.setHeader("cache-control", "no-cache");
				return writeHead.apply(this, arguments);
			};

			// the content will be put into a body array
			const body = [];
			let bodyEncoding;
			const appendToBody = function appendToBody(content, encoding) {
				if (shouldHandleResponse(res)) {
					if (content !== undefined) {
						body.push(content instanceof Buffer ? content.toString(encoding) : content);
					}
					bodyEncoding = bodyEncoding || encoding;
					return true;
				} else {
					return false;
				}
			};

			// when buffered, chunks of data may be written which need to be intercepted
			res.write = function interceptWrite(content, encoding) {
				if (!appendToBody(content, encoding)) return write.apply(this, arguments);
				return true;
			};

			res.end = async function interceptEnd(content, encoding) {
				if (!appendToBody(content, encoding)) return end.apply(this, arguments);
				// modify the content of the body
				end.call(res, await intercept(body.join(""), bodyEncoding, req), bodyEncoding);
			};
		}
		next();
	};

	// apply a name to the function to allow a better lookup
	// in the express middleware stack when debugging
	Object.defineProperty(fn, "name", {
		value: name,
		writable: false,
	});

	// that's it!
	return fn;
};
