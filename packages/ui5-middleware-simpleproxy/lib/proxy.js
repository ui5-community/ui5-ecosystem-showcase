/**
 * @typedef {object} [configuration] configuration
 * @property {string} mountPath - The path to mount the extension
 * @property {string} baseUri - The baseUri to proxy. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI
 * @property {boolean|yo<confirm|true>} [strictSSL] Ignore strict SSL checks. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL
 * @property {boolean|yo<confirm>} [removeETag] Removes the ETag header from the response to avoid conditional requests.
 * @property {string} [username] Username used for Basic Authentication. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME
 * @property {string|yo<password>} [password] Password used for Basic Authentication. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD
 * @property {map|yo<input>} [httpHeaders] Http headers set for the proxied request. Will overwrite the http headers from the request.
 * @property {map|yo<input>} [query] Query parameters set for the proxied request. Will overwrite the parameters from the request.
 * @property {string[]|yo<input>} [excludePatterns] Array of exclude patterns using glob syntax
 * @property {boolean|yo<confirm>} [skipCache] Remove the cache guid when serving from the FLP launchpad if it matches an excludePattern
 * @property {boolean|yo<confirm>} [debug] see output
 */

const hook = require("ui5-utils-express/lib/hook");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const minimatch = require("minimatch");

// load environment variables
const dotenv = require("dotenv");
dotenv.config();

// eslint-disable-next-line jsdoc/require-jsdoc
function parseBoolean(b) {
	return /^true|false$/i.test(b) ? JSON.parse(b.toLowerCase()) : undefined;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function parseJSON(v) {
	try {
		return JSON.parse(v);
		// eslint-disable-next-line no-unused-vars
	} catch (err) {
		return undefined;
	}
}

// eslint-disable-next-line jsdoc/require-jsdoc
function sanitizeObject(o) {
	return (
		o &&
		Object.keys(o)
			.filter((key) => {
				return o[key] != null;
			})
			.reduce((acc, key) => {
				acc[key] = o[key];
				return acc;
			}, {})
	);
}

/**
 * UI5 server proxy middleware
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({ log, options, middlewareUtil }) {
	// determine environment variables
	const env = {
		baseUri: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
		strictSSL: parseBoolean(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL),
		httpHeaders: parseJSON(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_HTTP_HEADERS || process.env.UI5_MIDDLEWARE_HTTP_HEADERS /* compat */),
		removeETag: parseBoolean(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_REMOVEETAG),
		username: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME,
		password: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD,
		query: parseJSON(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_QUERY),
	};

	// provide a set of default runtime options
	const effectiveOptions = {
		debug: false,
		baseUri: null,
		strictSSL: true,
		removeETag: false,
		username: null,
		password: null,
		httpHeaders: {},
		query: null,
		excludePatterns: [],
		skipCache: false,
		enableWebSocket: false,
	};

	// config-time options from ui5.yaml for cfdestination take precedence
	Object.assign(effectiveOptions, sanitizeObject(options.configuration), /* env values */ sanitizeObject(env));

	// effective configuration options
	const { debug, baseUri, strictSSL, removeETag, username, password, httpHeaders, query, excludePatterns, skipCache } = effectiveOptions;

	// log the configuration for the proxy in debug mode
	debug && log.info(`[${baseUri}] Effective configuration:\n${JSON.stringify(effectiveOptions, undefined, 2)}`);

	// validate baseUri and determine the protocol
	const baseURL = new URL(baseUri);
	const ssl = /^(https|wss)/i.test(baseURL.protocol);

	// support for coporate proxies (for HTTPS or HTTP)
	const { getProxyForUrl } = await import("proxy-from-env");
	const proxyUrl = getProxyForUrl(baseURL);
	let agent;
	if (ssl) {
		const { HttpsProxyAgent } = await import("https-proxy-agent");
		agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
	} else {
		const { HttpProxyAgent } = await import("http-proxy-agent");
		agent = proxyUrl ? new HttpProxyAgent(proxyUrl) : undefined;
	}
	debug && log.info(`[${baseUri}] Proxy: ${proxyUrl ? proxyUrl : "n/a"}`);

	// check whether the request should be included or not
	const hasExcludePatterns = excludePatterns && Array.isArray(excludePatterns);
	const filter = function (pathname, req) {
		if (hasExcludePatterns) {
			const targetPath = pathname.substring(req.baseUrl?.length || 0);
			const exclude = excludePatterns.some((glob) => minimatch(targetPath, glob));
			if (exclude) {
				const url = req.url;
				debug && log.info(`[${baseUri}] Request ${url} is excluded`);
				const reCBToken = /\/~.*~.\//g;
				if (skipCache && reCBToken.test(url)) {
					const newUrl = url.replace(reCBToken, "/");
					debug && log.info(`[${baseUri}] Removing cachebuster token from ${url}, resolving to ${newUrl}`);
					req.url = newUrl;
				}
			}
			return !exclude;
		}
		return true;
	};

	// run the proxy middleware based on the host configuration
	const target = /^(.*)\/$/.exec(baseURL.toString())?.[1] || baseURL.toString(); // remove trailing slash!
	const proxyMiddleware = createProxyMiddleware(filter, {
		logLevel: effectiveOptions.debug ? "info" : "warn",
		target,
		agent,
		secure: strictSSL,
		changeOrigin: true, // for vhosted sites
		autoRewrite: true, // rewrites the location host/port on (301/302/307/308) redirects based on requested host/port
		xfwd: true, // adds x-forward headers
		auth: username != null && password != null ? `${username}:${password}` : undefined,
		headers: httpHeaders,
		pathRewrite: function (path, req) {
			// we first determine the baseUrl to strip off the path
			let baseUrl = req.baseUrl;
			if (req["ui5-patched-router"]?.baseUrl) {
				baseUrl = baseUrl.substring(req["ui5-patched-router"].baseUrl.length);
			}
			path = path.substring(baseUrl.length);
			// append the query parameters if available
			if (query) {
				const url = new URL(path, new URL("/", baseURL));
				let pathname = url.pathname;
				if (pathname === "/") {
					pathname = "";
				}
				const search = url.searchParams;
				Object.keys(query).forEach((key) => search.append(key, query[key]));
				path = `${pathname}${url.search}`;
			}
			return path;
		},
		selfHandleResponse: true, // + responseInterceptor: necessary to omit ERR_CONTENT_DECODING_FAILED error when opening OData URls directly
		onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
			const url = req.url;
			effectiveOptions.debug && log.info(`[${baseUri}] ${req.method} ${url} -> ${target}${url} [${proxyRes.statusCode}]`);
			// remove the secure flag of the cookies
			if (ssl) {
				const setCookie = res.getHeader("set-cookie");
				if (Array.isArray(setCookie)) {
					res.setHeader(
						"set-cookie",
						proxyRes.headers["set-cookie"]
							// remove flag 'Secure'
							.map(function (cookieValue) {
								return cookieValue.replace(/;\s*secure\s*(?:;|$)/gi, ";");
							})
							// remove attribute 'Domain'
							.map(function (cookieValue) {
								return cookieValue.replace(/;\s*domain=[^;]+\s*(?:;|$)/gi, ";");
							})
							// remove attribute 'Path'
							.map(function (cookieValue) {
								return cookieValue.replace(/;\s*path=[^;]+\s*(?:;|$)/gi, ";");
							})
							// remove attribute 'SameSite'
							.map(function (cookieValue) {
								return cookieValue.replace(/;\s*samesite=[^;]+\s*(?:;|$)/gi, ";");
							}),
					);
				}
			}
			// remove etag
			if (removeETag) {
				debug && log.info(`[${baseUri}] Removing etag from ${url}`);
				res.removeHeader("etag", undefined);
			}
			return responseBuffer;
		}),
	});

	// manually install the upgrade function for the websocket
	return effectiveOptions.enableWebSocket
		? hook(
				"ui5-middleware-simpleproxy",
				({ on, options }) => {
					const { mountpath } = options;
					on("upgrade", (req, socket, head) => {
						// only handle requests in the mountpath
						if (mountpath === req.url) {
							req.baseUrl = req.url;
							req.url += "/";
							// call the upgrade function of the proxy middleware to
							// initialize the websocket and establish the connection
							proxyMiddleware.upgrade.call(this, req, socket, head);
						}
					});
				},
				proxyMiddleware,
			)
		: proxyMiddleware;
};
