/* eslint-disable no-undef */
const log = require("@ui5/logger").getLogger("server:custommiddleware:stringreplacer");

const minimatch = require("minimatch");
const etag = require("etag");
const fresh = require("fresh");

// eslint-disable-next-line jsdoc/require-jsdoc
function isFresh(req, res) {
	return fresh(req.headers, {
		etag: res.getHeader("ETag"),
	});
}

// TODO: for now, we duplicate the code of the ui5-task-stringreplacer and the ui5-middleware-stringreplacer
//       BUT for the future we should consider a reuse module for the middlewares and tasks in this repository.

// BEGIN: copy of code from ui5-task-stringreplacer

const escapeRegExp = require("lodash.escaperegexp");
const replaceStream = require("replacestream");

if (process.env.UI5_ENV) {
	log.info(`UI5_ENV set to ${process.env.UI5_ENV}: loading ./${process.env.UI5_ENV}.env`);
	require("dotenv").config({ path: `./${process.env.UI5_ENV}.env` });
} else {
	require("dotenv").config(); //loads './.env'
}

// get all environment variables
const envVariables = process.env;

// manage placeholders
let placeholderStrings = {};
// eslint-disable-next-line jsdoc/require-jsdoc
function addPlaceholderString(key, value) {
	placeholderStrings[key] = value;
}

// loop through env variables to find keys which are having prefix 'stringreplacer'
if (typeof envVariables === "object") {
	for (key in envVariables) {
		// env variable should start with 'stringreplacer' and should in format 'stringreplacer.placeholder'
		if (/^stringreplacer\.(.+)$/i.test(key)) {
			let placeholderString = /^stringreplacer\.(.+)$/i.exec(key)[1];
			addPlaceholderString(placeholderString, envVariables[key]);
		}
	}
}

// check if we found any strings to replace
let hasStringsToReplace = Object.keys(placeholderStrings).length > 0;
if (!hasStringsToReplace) {
	log.warn(`No strings to replace provided either through the process environment or middleware config`);
}

// create the helper function to pipe the stream and replace the placeholders
// eslint-disable-next-line jsdoc/require-jsdoc
function createReplacePlaceholdersDestination({ resource, isDebug }) {
	const replaceStreamRegExp = `(${Object.keys(placeholderStrings)
		.map((placeholder) => {
			return escapeRegExp(placeholder);
		})
		.join("|")})`;
	return replaceStream(new RegExp(replaceStreamRegExp, "g"), (match) => {
		isDebug && log.info(`${resource.getPath()} matched: ${match}; replacing with ${placeholderStrings[match]}`);
		return placeholderStrings[match];
	});
}

// END: copy of code from ui5-task-stringreplacer

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
		const { replace } = options.configuration;
		replace &&
			replace.forEach((entry) => {
				addPlaceholderString(entry.placeholder, entry.value);
			});
	}

	// helper to determine whether to handle the request or not
	// eslint-disable-next-line jsdoc/require-jsdoc
	function handleRequest(path) {
		return filesToInclude.some((value) => {
			return minimatch(path, value);
		});
	}

	// returns the middleware function
	return async function stringreplacer(req, res, next) {
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

			// determine charset and content-type
			const { contentType, charset } = middlewareUtil.getMimeInfo(resource.getPath());
			if (!res.getHeader("Content-Type")) {
				res.setHeader("Content-Type", contentType);
			}

			// stream replacement only works for UTF-8 resources!
			let stream = resource.getStream();
			if (!charset || charset === "UTF-8") {
				stream.setEncoding("utf8");
				stream = stream.pipe(createReplacePlaceholdersDestination({ resource, isDebug }));
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
