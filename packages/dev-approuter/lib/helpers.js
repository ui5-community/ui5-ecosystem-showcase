const path = require("path");

/**
 * Parses the approuter configuration from an `xs-dev.json` file.
 * If that file doesn't exist, it looks for an `xs-app.json` file.
 * Also scans the routes of the config file and checks for the `dependency` property
 * and stores those in `config.dependencyRoutes`, which is where the dev approuter will do its magic.
 * @returns {Object} the approuter configuration including all `dependencyRoutes`.
 */
const parseConfig = () => {
    let config;
    let configFile;
    let configFiles = ["xs-dev.json", "xs-app.json"];
    for (const file of configFiles) {
        if (fs.existsSync(path.join(process.cwd(), file))) {
            config = JSON.parse(
                fs.readFileSync(
                    path.join(process.cwd(), file),
                    { encoding: "utf8" }
                )
            );
            configFile = file;
            break;
        }
    }
    config.dependencyRoutes = {};
    config.routes?.forEach(route => {
        if (route.dependency) {
            if (config.dependencyRoutes[`${route.dependency}`]) {
                throw new Error(`Duplicate dependency "${route.dependency}" found in file ${path.join(process.cwd(), configFile)}.`);
            } else {
                config.dependencyRoutes[`${route.dependency}`] = route;
            }
        }
    });
    return config;
};

/**
 * Applies the `config.dependencyRoutes` to the `config.routes` and removes them.
 * @param {Object} config - the approuter configuration including all `dependencyRoutes`.
 * @returns {Object} config - the approuter configuration that can be used to start the approuter.
 */
const applyDependencyConfig = (config) => {
    config.routes?.forEach(route => {
        if (route.dependency) {
            route = config.dependencyRoutes[route.dependency];
        }
    });
    delete config.dependencyRoutes;
    return config;
};

/**
 * Adds a destination to `process.env.destinations` for a given module.
 * If a destination with this `name === moduleId` already exists, no new destination will be created.
 * @param {String} moduleId - the id of the module that a destination is created for.
 * @param {Number} port - the port of the localhost that the destination should point to.
 * @param {String} mountPath - the path the module was mounted to and the destination should point to.
 */
const addDestination = (moduleId, port, mountPath) => {
    let destinations = [];
    if (process.env.destinations) {
        destinations = JSON.parse(process.env.destinations);
    }

    let url;
    if (mountPath) {
        url = `http://localhost:${process.env.PORT || 5000}${mountPath}`;
    } else {
        url = `http://localhost:${port}`;
    }

    // only add new destination if it's not already provided
    const destinationAlreadyExists = destinations.some(destination => {
        const lowerCaseDestination = {};
        Object.keys(destination).forEach(key => {
            lowerCaseDestination[key.toLowerCase()] = destination[key];
        })
        return lowerCaseDestination.name === moduleId
    })
    if (!destinationAlreadyExists) {
        destinations.push({
            Name: moduleId,
            Authentication: "NoAuthentication",
            ProxyType: "Internet",
            Type: "HTTP",
            URL: url
        });
        process.env.destinations = JSON.stringify(destinations);
    }
};

/**
 * Configures the route for a given CAP module.
 * @param {String} moduleId - the id of the module that the route should be configured for.
 * @param {String[]} servicePaths - an array of service paths that the CAP module serves.
 * @param {Object} route - the route that is to be configured.
 * @returns {Object} the configured route.
 */
const configureCAPRoute = (moduleId, servicesPaths, route) => {
    route.source = servicesPaths.map(path => { return path + "(.*)" }).join("|");
    route.destination = moduleId;
    delete route.dependency;

    return route;
};

/**
 * Configures the route for a given UI5 module.
 * @param {String} moduleId - the id of the module that the route should be configured for. 
 * @param {String} sourcePath - the path the approuter should handle the module at.
 * @param {Object} route - the route that is to be configured.
 * @returns {Object} the configured route.
 */
const configureUI5Route = (moduleId, sourcePath, route) => {
    if (sourcePath === "/") {
        // special regex to avoid endless loop
        route.source = `^(?!.*(/_${sourcePath}))`;
    } else {
        route.source = `^${sourcePath}(.*)$`;
        route.target = "$1";
    }
    route.destination = moduleId;
    delete route.dependency;

    return route;
};

module.exports = {
    parseConfig,
    applyDependencyConfig,
    addDestination,
    configureCAPRoute,
    configureUI5Route
};