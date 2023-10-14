/* eslint-disable no-undef */
const { createReplacePlaceholdersDestination, addPlaceholderString, readPlaceholderFromEnv, isPathOnContentTypeExcludeList } = require("./util");

const { Readable } = require("stream");
const minimatch = require("minimatch");
const intercept = require("ui5-utils-express/lib/intercept");

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {module:@ui5/server.middleware.MiddlewareUtil} parameters.middlewareUtil Specification version dependent
 *                                                       interface to a MiddlewareUtil instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = function createMiddleware({ log, resources, options, middlewareUtil }) {
	const isDebug = options.configuration && options.configuration.debug;

	// get all environment variables
	const prefix = options.configuration?.prefix ? options.configuration?.prefix : "UI5_ENV"; // default
	const path = options.configuration?.path ? options.configuration?.path : "./"; // default
	const placeholderStrings = readPlaceholderFromEnv(path, prefix, log);

	let filesToInclude = [];
	if (options.configuration) {
		// extract the configuration of files to be included
		const { files } = options.configuration;
		if (Array.isArray(files)) {
			filesToInclude = [...files];
		} else {
			filesToInclude.push(files);
		}
		// extract the placeholder strings from the configuration
		options.configuration?.replace?.forEach((entry) => {
			addPlaceholderString(entry.placeholder, entry.value);
		});
	}

	// check if we found any strings to replace
	let hasStringsToReplace = Object.keys(placeholderStrings).length > 0;
	if (!hasStringsToReplace) {
		log.warn(`No strings to replace provided either through the process environment or middleware config`);
	}

	// helper to determine whether to handle the request or not
	// eslint-disable-next-line jsdoc/require-jsdoc
	function getPathname(req) {
		return req.url?.match("^[^?]*")[0];
	}
	// eslint-disable-next-line jsdoc/require-jsdoc
	function handleRequest(path) {
		return filesToInclude.some((value) => {
			return minimatch(path, value);
		});
	}

	// returns the middleware function to intercept the response
	return intercept(
		"ui5-tooling-stringreplace-middleware",
		async (req) => {
			if (!hasStringsToReplace) {
				return false;
			}

			// only handle if a resource could be found
			const pathname = getPathname(req);
			const resource = await resources.all.byPath(pathname);
			if (!resource) {
				return false;
			}

			// ignore framework project dependencies
			if (resource.getProject().isFrameworkProject()) {
				return false;
			}

			// never replace strings in these mime types
			if (isPathOnContentTypeExcludeList(resource.getPath())) {
				return false;
			}

			// finally check whether to handle the request or not
			return handleRequest(pathname);
		},
		async (body, encoding, req) => {
			// rewrite the content of the body using the streaming API
			const buffer = Buffer.from(body, encoding);
			const readable = Readable.from(buffer);
			const newResource = middlewareUtil.resourceFactory.createResource({
				path: getPathname(req),
			});
			newResource.setStream(readable.pipe(createReplacePlaceholdersDestination(newResource, isDebug, log)));
			return await newResource.getString();
		}
	);
};
