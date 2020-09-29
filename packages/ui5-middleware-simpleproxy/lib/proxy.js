let proxy = require('express-http-proxy');
const log = require("@ui5/logger").getLogger("server:custommiddleware:proxy");
const dotenv = require('dotenv');

dotenv.config();

const env = {
  baseUri: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
  strictSSL: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL,
  httpHeaders: process.env.UI5_MIDDLEWARE_HTTP_HEADERS,
  limit: process.env.UI5_MIDDLEWARE_LIMIT
};

/**
 * Handle decision between configuration and environment value while processing
 * string values from environment and possible null and undefined values. Any string
 * passed to environment variable except `"false"` will default to `true`. If both
 * values are undefined or null, return `true` as well.
 *
 * @param {?boolean} environmentValue Value of the environment variable 
 *                                  UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL
 * @param {?boolean} configurationValue Value from the ui5.yaml configuration
 * @returns {boolean} Indicator whether to require strict SSL checking
 */
function deriveStrictSSL(environmentValue, configurationValue) {
  const environmentBooleanOrNull =
    (environmentValue === undefined || environmentValue === null)
      ? undefined
      : !(environmentValue === "false");

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
 * @param {Object} configuration The configuration object
 * 
 * @returns {Object} http headers
 */
function getHttpHeaders(environmentValue, configuration) {
  let httpHeaders;
  if (environmentValue) {
    httpHeaders = JSON.parse(environmentValue);
  } else if (configuration) {
    httpHeaders = configuration.httpHeaders;
  }
  httpHeaders && configuration && configuration.debug && log.info(`HTTP headers will be injected: ${Object.keys(httpHeaders).join(", ")} `);
  return httpHeaders;
}

/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({ resources, options }) {
  // Environment wins over YAML configuration when loading settings
  const providedBaseUri = env.baseUri || (options.configuration && options.configuration.baseUri);
  const providedStrictSSL = deriveStrictSSL(
    env.strictSSL,
    options.configuration ? options.configuration.strictSSL : undefined
  );
  const providedHttpHeaders = getHttpHeaders(env.httpHeaders, options.configuration);
  options.configuration && options.configuration.debug && log.info(`Starting proxy for baseUri ${providedBaseUri}`);
  // determine the uri parts (protocol, baseUri, path)
  let baseUriParts = providedBaseUri.match(/(https|http)\:\/\/([^/]*)(\/.*)?/i);
  if (!baseUriParts) {
    throw new Error(`The baseUri ${providedBaseUri} is not valid!`);
  }
  let protocol = baseUriParts[1];
  let baseUri = baseUriParts[2];
  let path = baseUriParts[3];
  if (path && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  const limit = env.limit || (options.configuration && options.configuration.limit);

  // run the proxy middleware based on the baseUri configuration
  return proxy(baseUri, {
    https: protocol === "https",
    limit: limit,
    preserveHostHdr: false,
    proxyReqOptDecorator: function (proxyReqOpts) {
      if (providedStrictSSL === false) {
        proxyReqOpts.rejectUnauthorized = false;
      }
      if (providedHttpHeaders) {
        Object.assign(proxyReqOpts.headers, providedHttpHeaders); 
      }
      return proxyReqOpts;
    },
    proxyReqPathResolver: function (req) {
      return (path ? path : "") + req.url;
    },
    userResHeaderDecorator: function(headers) {
      if (protocol === "https") {
        Object.keys(headers).forEach((headerName) => {
          if (/set-cookie/i.test(headerName)) {
            // remove the secure flag of the cookies
            if (Array.isArray(headers[headerName])) {
              headers[headerName] = headers[headerName]
                // remove flag 'Secure'
                .map(function(cookieValue) {
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
  });
};
