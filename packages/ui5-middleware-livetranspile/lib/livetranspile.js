const babel = require("@babel/core")
const os = require("os")
const parseurl = require("parseurl")
const log = require("@ui5/logger").getLogger("server:custommiddleware:livetranspile")
const merge = require("lodash.merge")

let fileNotFoundError = new Error("file not found!")
fileNotFoundError.code = 404
fileNotFoundError.file = ""

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
    const plugins =
        options.configuration && options.configuration.transpileAsync
            ? [
                  "babel-plugin-transform-async-to-promises",
                  {
                      inlineHelpers: true
                  }
              ]
            : []
    const babelConfig =
        options.configuration && options.configuration.babelConfig
            ? options.configuration.babelConfig
            : {
                  sourceMaps: "inline",
                  plugins,
                  presets: [
                      [
                          "@babel/preset-env",
                          {
                              targets: {
                                  browsers: "last 2 versions, ie 10-11"
                              }
                          }
                      ]
                  ]
              }

    return (req, res, next) => {
        if (
            req.path &&
            req.path.endsWith(".js") &&
            !req.path.includes("resources/") &&
            !((options.configuration && options.configuration.excludePatterns) || []).some((pattern) =>
                req.path.includes(pattern)
            )
        ) {
            const pathname = parseurl(req).pathname

            // grab the file via @ui5/fs.AbstractReader API
            return resources.rootProject
                .byPath(pathname)
                .then((resource) => {
                    options.configuration && options.configuration.debug && log.info(`handling ${req.path}...`)
                    if (!resource) {
                        fileNotFoundError.file = pathname
                        throw fileNotFoundError
                    }
                    // read file into string
                    return resource.getString()
                })
                .then((source) => {
                    options.configuration && options.configuration.debug ? log.info(`...${pathname} transpiled!`) : null
                    const babelConfigForFile = merge({}, babelConfig, {
                        filename: pathname // necessary for source map <-> source assoc
                    })
                    return babel.transformAsync(source, babelConfigForFile)
                })
                .then((result) => {
                    // send out transpiled source + source map
                    res.type(".js")
                    // since Babel does not care about linefeeds (https://github.com/babel/babel/issues/8921#issuecomment-492429934)
                    // we have to search for any EOL character and replace it with correct EOL for this OS
                    let correctLinefeed = result.code.replace(/\r\n|\r|\n/g, os.EOL)
                    res.end(correctLinefeed)
                })
                .catch((err) => {
                    if (err.code === 404) {
                        log.warn(`...file not found: ${err.file}!`)
                    } else {
                        log.error(err)
                    }
                    next()
                })
        } else {
            next()
        }
    }
}
