const log = require("@ui5/logger").getLogger("server:custommiddleware:webjars")

const JSZip = require("jszip");

const path = require("path");

const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);


/**
 * Serve the content from JAR files (following the web static resources concept of Servlet 3.0)
 * which allows to consume static resources from within JAR files out of the folder META-INF/resources.
 * In addition, the JAR resources can also follow the UI5 static resources concept whiich is 
 * derived from the web static resources concept which serves /resources from /META-INF/resources and
 * /test-resourcees from /META-INF/test-resources.
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
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {function} Middleware function to use
 */
module.exports = async ({ resources, options, middlewareUtil }) => {

    const isDebug = options && options.configuration && options.configuration.debug;
    const rootPath = options && options.configuration && options.configuration.rootPath || "jars";
    const jarRootPath = options && options.configuration && options.configuration.jarRootPath || "META-INF/resources/";

    const basePath = path.join(process.cwd(), rootPath);
    if (isDebug) {
        log.info(`Scanning directory ${basePath} for JAR files...`);
    }

    // list all JAR files
    const files = await readdirAsync(basePath);
    const jars = await Promise.all(files.filter(file => {
        return file.endsWith(".jar");
    }).map(async file => {
        if (isDebug) {
            log.info(`  - Found JAR file ${file}`);
        }
        const data = await readFileAsync(path.join(basePath, file));
        return JSZip.loadAsync(data);
    }));

    // read the content of the JAR files into a map
    let jarResources = {};
    await Promise.all(jars.map(async jar => {
        await Promise.all(Object.keys(jar.files).filter(entry => {
            return entry.startsWith(jarRootPath) && !entry.endsWith("/");
        }).map(async entry => {
            jarResources[entry] = await jar.file(entry).async("string");
        }));
    }));

    return async function serveWebJARs(req, res, next) {

        const pathname = middlewareUtil.getPathname(req);
        const jarPath = jarRootPath + pathname.substr(1);

        const jarResource = jarResources[jarPath];
        if (jarResource) {
            if (isDebug) {
                log.info(`Serving ${pathname} from JAR!`);
            }

            // determine charset and content-type
            let {contentType, charset} = middlewareUtil.getMimeInfo(pathname);
            if (pathname.endsWith(".properties")) {
                contentType = "text/plain";
            }
            if (!res.getHeader("Content-Type")) {
                res.setHeader("Content-Type", contentType);
            }

            res.send(jarResource);
            res.end();

        } else {
            next();
        }

    };

};
