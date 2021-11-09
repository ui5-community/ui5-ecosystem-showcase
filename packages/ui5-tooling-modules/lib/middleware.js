const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-modules");

const { generateBundle } = require("./util");

/**
 * Custom middleware to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({
    resources, options, middlewareUtil
}) {

    const config = options.configuration || {}

    return async (req, res, next) => {

        const time = Date.now();

        const match = /^\/resources\/(.*)\.js$/.exec(req.path);
        if (match) {

            const bundle = await generateBundle(match[1]);
            if (bundle) {
                try {

                    // determine charset and content-type
                    let {
                        contentType,
                        charset
                    } = middlewareUtil.getMimeInfo(req.path);
                    res.setHeader("Content-Type", contentType);
    
                    res.send(bundle);
    
                    res.end();
    
                    log.verbose(`Created bundle for ${req.path}`);
    
                    log.info(`Bundling took ${(Date.now() - time)} millis`);
    
                    return;
    
                } catch (err) {
                    log.error(`Couldn't write bundle ${match[1]}: ${err}`);
                }
            }

        }

        next();

    }

}
