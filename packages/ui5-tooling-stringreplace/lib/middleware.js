/* eslint-disable no-undef */
const log = require("@ui5/logger").getLogger("server:custommiddleware:stringreplace");

const { createReplacePlaceholdersDestination, addPlaceholderString, getMimeInfo, readPlaceholderFromEnv, isPathOnContentTypeExcludeList } = require("./util");

const minimatch = require("minimatch");
const etag = require("etag");
const fresh = require("fresh");

// eslint-disable-next-line jsdoc/require-jsdoc
function isFresh(req, res) {
	return fresh(req.headers, {
		etag: res.getHeader("ETag"),
	});
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
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = function createMiddleware({ resources, options, middlewareUtil }) {
	const isDebug = options.configuration && options.configuration.debug;

	// get all environment variables
	const prefix = options.configuration?.prefix ? options.configuration?.prefix : "UI5_ENV"; // default
	const path = options.configuration?.ui5_env_path ? options.configuration?.ui5_env_path : "./"; // default
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
	function handleRequest(path) {
		return filesToInclude.some((value) => {
			return minimatch(path, value);
		});
	}

	// returns the middleware function
	return async function stringreplace(req, res, next) {
		if (!hasStringsToReplace) {
			// Nothing to do
			next();
			return;
		}

		const pathname = middlewareUtil.getPathname(req);
		const resource = await resources.all.byPath(pathname);
		if (!resource) {
			// Resource not found
			next();
			return;
		}

		// never replace strings in these mime types
		if (isPathOnContentTypeExcludeList(resource.getPath())) {
			next();
			return;
		}

		if (handleRequest(pathname)) {
			//isDebug && log.info(`handling ${pathname}`);

			// enable ETag caching
			res.setHeader("ETag", etag(resource.getStatInfo()));

			if (isFresh(req, res)) {
				// client has a fresh copy of the resource
				res.statusCode = 304;
				res.end();
				return;
			}

			// determine charset
			const { charset, contentType } = getMimeInfo(resource.getPath());

			if (!res.getHeader("Content-Type")) {
				res.setHeader("Content-Type", contentType);
			}

			// stream replacement only works for UTF-8 resources!
			let stream = resource.getStream();
			if (!charset || charset === "UTF-8") {
				stream.setEncoding("utf8");
				stream = stream.pipe(createReplacePlaceholdersDestination(resource, isDebug, log));
			} else {
				isDebug && log.warn(`skipping placeholder replacement for non-UTF-8 resource ${pathname}`);
			}
			stream.pipe(res);

			return;
		} else {
			next();
			return;
		}
	};
};
