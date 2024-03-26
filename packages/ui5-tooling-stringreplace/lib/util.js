const escapeRegExp = require("lodash.escaperegexp");
const replaceStream = require("replacestream");
const mime = require("mime-types");

// manage placeholders
let placeholderStrings = {};

const _self = (module.exports = {
	isPathOnContentTypeExcludeList: function isPathOnContentTypeExcludeList(path) {
		const { contentType } = _self.getMimeInfo(path);

		// TODO: change to regex
		if (contentType.includes("image") || contentType.includes("video")) {
			return true;
		}
		return false;
	},
	readPlaceholderFromEnv: function readPlaceholderFromEnv(path, prefix, separator, log) {
		if (process.env[prefix]) {
			log.info(`${prefix} set to ${process.env[prefix]}: loading ${path}${process.env[prefix]}.env`);
			const result = require("dotenv").config({ path: `${path}${process.env[prefix]}.env` });
			if (result.error) {
				log.warn(result.error);
			}
		} else {
			require("dotenv").config(); //loads './.env'
		}

		// get all environment variables
		const envVariables = process.env;

		// env variable should start and should be in format 'stringreplace<separator><placeholder>', e.g. 'stringreplace.variable' or 'stringreplace_variable'
		const regex = new RegExp(`stringreplace${separator}(.+)`, "i");

		// loop through env variables to find keys which are having prefix 'stringreplace'
		if (typeof envVariables === "object") {
			let key;
			for (key in envVariables) {
				if (regex.test(key)) {
					let placeholderString = regex.exec(key)[1];
					_self.addPlaceholderString(placeholderString, envVariables[key]);
				}
			}
		}

		return placeholderStrings;
	},

	// create the helper function to pipe the stream and replace the placeholders
	// eslint-disable-next-line jsdoc/require-jsdoc
	createReplacePlaceholdersDestination: function createReplacePlaceholdersDestination(resource, isDebug, log) {
		const replaceStreamRegExp = `(${Object.keys(placeholderStrings)
			.map((placeholder) => {
				return escapeRegExp(placeholder);
			})
			.join("|")})`;
		return replaceStream(new RegExp(replaceStreamRegExp, "g"), (match) => {
			isDebug && log.info(`${resource.getPath()} matched: ${match}; replacing with ${placeholderStrings[match]}`);
			return placeholderStrings[match];
		});
	},

	// eslint-disable-next-line jsdoc/require-jsdoc
	addPlaceholderString: function addPlaceholderString(key, value) {
		placeholderStrings[key] = value;
	},

	/**
	 * COPY of ui5-server/middleware/MiddelwareUtil
	 *
	 * Returns MIME information derived from a given resource path.
	 * </br></br>
	 * This method is only available to custom middleware extensions defining
	 * <b>Specification Version 2.0 and above</b>.
	 *
	 * @param {object} resourcePath
	 * @returns {@ui5/server/middleware/MiddlewareUtil.MimeInfo}
	 * @public
	 */
	getMimeInfo: function getMimeInfo(resourcePath) {
		const type = resourcePath.endsWith(".ts") ? "application/javascript" : mime.lookup(resourcePath) || "application/octet-stream";
		const charset = mime.charset(type);
		return {
			type,
			charset,
			contentType: type + (charset ? "; charset=" + charset : ""),
		};
	},
});
