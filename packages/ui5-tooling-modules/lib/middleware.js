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
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.skipCache] Flag whether the module cache for the bundles should be skipped
 * @returns {function} Middleware function to use
 */
module.exports = function ({
    resources, options, middlewareUtil
}) {

    const config = options.configuration || {}
    log.verbose(`Starting ui5-tooling-modules-middleware`);

    return async (req, res, next) => {

        const reqPath = middlewareUtil.getPathname(req);

        const time = Date.now();

        const match = /^\/resources\/(.*)\.js$/.exec(reqPath);
        if (match) {

            const bundleName = match[1];
            const bundle = await generateBundle(bundleName, config.skipCache);
            if (bundle) {
                try {

                    // determine charset and content-type
                    let {
                        contentType,
                        charset
                    } = middlewareUtil.getMimeInfo(reqPath);
                    res.setHeader("Content-Type", contentType);

                    res.end(bundle);

                    log.verbose(`Process resource ${bundleName}`);

                    log.info(`Processing took ${(Date.now() - time)} millis`);

                    return;

                } catch (err) {
                    log.error(`Couldn't process resource ${bundleName}: ${err}`);
                }
            }

        }

        next();

    }

}
