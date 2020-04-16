let proxy = require('express-http-proxy');
const log = require("@ui5/logger").getLogger("server:custommiddleware:proxy");
const dotenv = require('dotenv');

dotenv.config();

const env = {
  baseUri: process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI,
  strictSSL: !(process.env.UI5_MIDDLEWARE_SIMPLE_PROXY_STRICT_SSL === "false")
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
module.exports = function({resources, options}) {
    const providedBaseUri = (options.configuration && options.configuration.baseUri) || env.baseUri;
    const providedStrictSSL = (options.configuration && options.configuration.strictSSL) || env.strictSSL;

    /*
    return function (req, res, next) {
        // [...]
    }
    return proxy(options.configuration.baseUri);
    */
    options.configuration && options.configuration.debug ? log.info(`Starting proxy for baseUri ${providedBaseUri}`) : null;
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
    // run the proxy middleware based on the baseUri configuration
    return proxy(baseUri, {
      https: protocol === "https",
      preserveHostHdr: false,
      proxyReqOptDecorator: function(proxyReqOpts) {
        if (providedStrictSSL === false) {
          proxyReqOpts.rejectUnauthorized = false;
        }
        return proxyReqOpts;
      },
      proxyReqPathResolver: function (req) {
        return (path ? path : "") + req.url;
      }
    });    
};
