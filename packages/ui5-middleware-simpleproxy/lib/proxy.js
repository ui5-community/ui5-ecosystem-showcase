let proxy = require("express-http-proxy");
const log = require("@ui5/logger").getLogger("server:custommiddleware:proxy");
const minimatch = require("minimatch");
const dotenv = require("dotenv");

dotenv.config();

const env = {
	baseUri: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
	strictSSL: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL,
	httpHeaders: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_HTTP_HEADERS || process.env.UI5_MIDDLEWARE_HTTP_HEADERS /* compat */,
	limit: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_LIMIT,
	removeETag: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_REMOVEETAG,
	username: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME,
	password: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD,
	query: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_QUERY,
};

/**
 * @typedef {object} [configuration] configuration
 * @property {string} mountPath - The path to mount the extension
 * @property {string} baseUri - The baseUri to proxy. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI
 * @property {boolean|yo<confirm|true>} [strictSSL] Ignore strict SSL checks. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL
 * @property {string|yo<input|1mb>} [limit] This sets the body size limit, If the body size is larger than the specified (or default) limit,
a 413 Request Entity Too Large error will be returned
 * @property {boolean|yo<confirm>} [removeETag] Removes the ETag header from the response to avoid conditional requests.
 * @property {string} [username] Username used for Basic Authentication. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME
 * @property {string|yo<password>} [password] Password used for Basic Authentication. => env:UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD
 * @property {map|yo<input>} [httpHeaders] Http headers set for the proxied request. Will overwrite the http headers from the request.
 * @property {map|yo<input>} [query] Query parameters set for the proxied request. Will overwrite the parameters from the request.
 * @property {string[]|yo<input>} [excludePatterns] Array of exclude patterns using glob syntax
 * @property {boolean|yo<confirm>} [skipCache] Remove the cache guid when serving from the FLP launchpad if it matches an excludePattern
 * @property {boolean|yo<confirm>} [debug] see output
 */

/**
 * Handle decision between configuration and environment value while processing
 * string values from environment and possible null and undefined values. Any string
 * passed to environment variable except `"false"` will default to `true`. If both
 * values are undefined or null, return `true` as well.
 *
 * @param {boolean} [environmentValue] Value of the environment variable
 *                                  UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL
 * @param {boolean} [configurationValue] Value from the ui5.yaml configuration
 * @returns {boolean} Indicator whether to require strict SSL checking
 */
function deriveStrictSSL(environmentValue, configurationValue) {
	const environmentBooleanOrNull = environmentValue === undefined || environmentValue === null ? undefined : !(environmentValue === "false");

	if (environmentBooleanOrNull === undefined) {
		if (configurationValue === undefined || configurationValue === null) {
			return true;
		} else {
			return configurationValue;
		}
	} else {
		return environmentBooleanOrNull;
	}
}

/**
 * Get the HTTP headers from environment variable if exists, otherwise get from the configuration
 *
 * @param {string} environmentValue The value coming from the enviroment variable 'UI5_MIDDLEWARE_HTTP_HEADERS'
 * @param {object} configuration The configuration object
 * @returns {object} http headers
 */
function getHttpHeaders(environmentValue, configuration = {}) {
	let httpHeaders;
	if (environmentValue) {
		httpHeaders = JSON.parse(environmentValue);
	} else if (configuration) {
		httpHeaders = configuration.httpHeaders;
	}
	httpHeaders && configuration?.debug && log.info(`HTTP headers will be injected: ${Object.keys(httpHeaders).join(", ")} `);
	return httpHeaders;
}

/**
 * Get the authentication token, to be used send via Basic Authentication HTTP header, from environment variable if exists, otherwise get from the configuration
 *
 * @param {object} environmentValue The enviroment variable object UI5_MIDDLEWARE_SIMPLE_PROXY_*
 * @param {object} configuration The configuration object
 * @returns {string} Basic Authentication token username:password format
 */
function getBasicAuthenticationToken(environmentValue = {}, configuration = {}) {
	const username = environmentValue.username || configuration.username;
	const password = environmentValue.password || configuration.password;
	if (username && password) {
		return `${username}:${password}`;
	}
}

/**
 * Get query parameters from environment variable if exists, otherwise get from the configuration
 *
 * @param {string} environmentValue The value coming from the enviroment variable 'UI5_MIDDLEWARE_SIMPLE_PROXY_QUERY_PARAMETERS'
 * @param {object} configuration The configuration object
 * @returns {object} Query parameters
 */
function getQueryParameters(environmentValue, configuration = {}) {
	let queryParameters;
	if (environmentValue) {
		queryParameters = JSON.parse(environmentValue);
	} else if (configuration) {
		queryParameters = configuration.query;
	}
	queryParameters && configuration?.debug && log.info(`Query parameters will be attached: ${Object.keys(queryParameters).join(", ")} `);
	return queryParameters;
}

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
// eslint-disable-next-line no-unused-vars
module.exports = function ({ resources, options }) {
	const isDebug = options.configuration?.debug;
	// Environment wins over YAML configuration when loading settings
	const providedBaseUri = env.baseUri || options.configuration?.baseUri;
	const providedStrictSSL = deriveStrictSSL(env.strictSSL, options.configuration?.strictSSL);
	const providedHttpHeaders = getHttpHeaders(env.httpHeaders, options.configuration);
	const providedQueryParameters = getQueryParameters(env.query, options.configuration);
	isDebug && log.info(`Starting proxy for baseUri ${providedBaseUri}`);
	// determine the uri parts (protocol, baseUri, path)
	let baseUriParts = providedBaseUri?.match(/(https|http):\/\/([^/]*)(\/.*)?/i);
	if (!baseUriParts) {
		throw new Error(`The baseUri ${providedBaseUri} is not valid!`);
	}
	let protocol = baseUriParts[1];
	let baseUri = baseUriParts[2];
	let path = baseUriParts[3];
	if (path && path.endsWith("/")) {
		path = path.slice(0, -1);
	}
	const limit = env.limit || options.configuration?.limit;
	const removeETag = env.removeETag || options.configuration?.removeETag;
	const excludePatterns = options.configuration?.excludePatterns;
	isDebug && log.info(`excludePatterns: ${excludePatterns}`);

	// run the proxy middleware based on the baseUri configuration
	return proxy(baseUri, {
		https: protocol === "https",
		limit: limit,
		filter:
			excludePatterns &&
			Array.isArray(excludePatterns) &&
			function (req) {
				const pattern = !excludePatterns.some((glob) => {
					isDebug && log.info(`Proxy request ${req.url} is matched to glob "${glob}": ${minimatch(req.url, glob)} ${providedBaseUri}`);

					return minimatch(req.url, glob);
				});
				if (!pattern && req.url.includes("~") && options.configuration?.skipCache) {
					const newUrl = req.url.replaceAll(/\/~.*~.\//g, "/");
					isDebug && log.info(`Removing cache from ${req.url}, resolving to ${newUrl}`);
					req.url = newUrl;
				}
				return pattern;
			},
		preserveHostHdr: false,
		proxyReqOptDecorator: function (proxyReqOpts) {
			if (providedStrictSSL === false) {
				proxyReqOpts.rejectUnauthorized = false;
			}
			if (providedHttpHeaders) {
				Object.assign(proxyReqOpts.headers, providedHttpHeaders);
			}
			const authorizationToken = getBasicAuthenticationToken(env, options.configuration);
			if (authorizationToken) {
				proxyReqOpts.auth = authorizationToken;
			}
			return proxyReqOpts;
		},
		proxyReqPathResolver: function (req) {
			if (providedQueryParameters) {
				const queryParameters = {};
				let reqPath = "";
				// provided query parameters will overwrite the request one's
				Object.assign(queryParameters, req.query, providedQueryParameters);
				for (const [key, value] of Object.entries(queryParameters)) {
					if (reqPath) {
						reqPath = reqPath.concat(`&${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
					} else {
						// first query parameter
						reqPath = `${path ? path : ""}${req.path}?${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
					}
				}
				return reqPath;
			}
			return (path ? path : "") + req.url;
		},
		userResHeaderDecorator: function (headers) {
			if (protocol === "https") {
				Object.keys(headers).forEach((headerName) => {
					if (/set-cookie/i.test(headerName)) {
						// remove the secure flag of the cookies
						if (Array.isArray(headers[headerName])) {
							headers[headerName] = headers[headerName]
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
									// alternatively replace the value with 'Lax':
									// return cookieValue.replace(/;\s*samesite=[^;]+\s*(?:;|$)/gi, "; SameSite=Lax;");
								});
						}
					}
				});
			}
			return headers;
		},
		userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
			if (removeETag) {
				const fnEnd = userRes.end;
				userRes.end = function () {
					this.removeHeader("ETag");
					return fnEnd.apply(this, arguments);
				};
			}
			return proxyResData;
		},
	});
};
