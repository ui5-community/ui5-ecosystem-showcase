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

const { createProxyMiddleware } = require("http-proxy-middleware");

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
	} catch (e) {
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
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({ log, options }) {
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
	};

	// config-time options from ui5.yaml for cfdestination take precedence
	Object.assign(effectiveOptions, sanitizeObject(options.configuration), /* env values */ sanitizeObject(env));

	// effective configuration options
	const { debug, baseUri, strictSSL, removeETag, username, password, httpHeaders, query, excludePatterns, skipCache } = effectiveOptions;

	// log the configuration for the proxy in debug mode
	debug && log.info(`[${baseUri}] Effective configuration:\n${JSON.stringify(effectiveOptions, undefined, 2)}`);

	// validate baseUri and determine the protocol
	const baseURL = new URL(baseUri);
	const protocol = baseURL.protocol.slice(0, -1);
	const https = protocol === "https";

	// support for coporate proxies (for HTTPS or HTTP)
	const { getProxyForUrl } = await import("proxy-from-env");
	const proxyUrl = getProxyForUrl(baseURL);
	let agent;
	if (https) {
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
			const targetPath = pathname.substring(req.baseUrl.length);
			const exclude = excludePatterns.some((glob) => minimatch(targetPath, glob));
			if (exclude) {
				debug && log.info(`[${baseUri}] Request ${req.url} is excluded`);
				const reCBToken = /\/~.*~.\//g;
				if (skipCache && reCBToken.test(req.url)) {
					const newUrl = req.url.replace(reCBToken, "/");
					debug && log.info(`[${baseUri}] Removing cachebuster token from ${req.url}, resolving to ${newUrl}`);
					req.url = newUrl;
				}
			}
			return !exclude;
		}
		return true;
	};

	// run the proxy middleware based on the host configuration
	return createProxyMiddleware(filter, {
		logLevel: effectiveOptions.debug ? "info" : "warn",
		target: baseURL.toString(),
		secure: strictSSL,
		ws: true, // enable websocket support
		autoRewrite: true, // rewrites the location host/port on (301/302/307/308) redirects based on requested host/port
		agent,
		changeOrigin: true,
		auth: username != null && password != null ? `${username}:${password}` : undefined,
		headers: httpHeaders,
		pathRewrite: function (path, req) {
			let targetPath = path.substring(req.baseUrl.length);
			// append the query parameters if available
			if (query) {
				const url = new URL(targetPath, baseUri);
				const search = url.searchParams;
				Object.keys(query).forEach((key) => search.append(key, query[key]));
				targetPath = `${url.pathname}${url.search}`;
			}
			return targetPath;
		},
		onProxyRes: function (proxyRes, req /*, res */) {
			// logging
			effectiveOptions.debug && log.info(`[${baseUri}] ${req.method} ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path} [${proxyRes.statusCode}]`);
			// remove the secure flag of the cookies
			if (protocol === "https") {
				if (Array.isArray(proxyRes.headers["set-cookie"])) {
					proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"]
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
						});
				}
			}
			// remove etag
			if (removeETag) {
				debug && log.info(`[${baseUri}] Removing etag from ${req.url}`);
				delete proxyRes.headers["etag"];
			}
		},
	});
};
