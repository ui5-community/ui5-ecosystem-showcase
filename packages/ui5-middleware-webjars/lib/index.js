/* eslint-disable no-unused-vars */
const path = require("path");
const { existsSync } = require("fs");
const { readdir: readdirAsync, readFile: readFileAsync } = require("fs").promises;

const JSZip = require("jszip");

/**
 * Serve the content from JAR files (following the web static resources concept of Servlet 3.0)
 * which allows to consume static resources from within JAR files out of the folder META-INF/resources.
 * In addition, the JAR resources can also follow the UI5 static resources concept whiich is
 * derived from the web static resources concept which serves /resources from /META-INF/resources and
 * /test-resourcees from /META-INF/test-resources.
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options, middlewareUtil }) => {
	const isDebug = options?.configuration?.debug;
	const rootPath = options?.configuration?.rootPath;
	const jarRootPath = options?.configuration?.jarRootPath || "META-INF/resources/";
	const classpathFile = options?.configuration?.classpathFile;

	// read classpath file or scan the JAR directory
	let files;
	if (classpathFile) {
		// read the classpath file which contains the JAR files separated by the
		// path.delimiter e.g. created via the maven-dependency-plugin by executing:
		//   > mvn clean dependency:build-classpath -Dmdep.cpFile=target/classpath
		const cpFile = path.join(process.cwd(), classpathFile);
		if (existsSync(cpFile)) {
			if (isDebug) {
				log.info(`Using classpath file ${classpathFile} to determine new JAR files...`);
			}
			const classpath = await readFileAsync(cpFile, { encoding: "utf8" });
			files = classpath.split(path.delimiter);
		} else {
			log.error(`The classpath file ${classpathFile} doesn't exist!`);
			throw new Error(`The classpath file ${classpathFile} doesn't exist!`);
		}
	} else if (rootPath) {
		// scanning the root path for the JAR files
		const basePath = path.join(process.cwd(), rootPath);
		if (existsSync(basePath)) {
			if (isDebug) {
				log.info(`Scanning directory ${basePath} for JAR files...`);
			}
			files = (await readdirAsync(basePath)).map((file) => {
				return path.join(basePath, file);
			});
		} else {
			log.error(`The rootPath ${basePath} of the JAR files doesn't exist!`);
			throw new Error(`The rootPath ${basePath} of the JAR files doesn't exist!`);
		}
	} else {
		// if no rootPath and no classpathFile has been defined, we disable the middleware
		log.warn(`Neither rootPath nor classpathFile has been defined!`);
		return async function noopWebJARs(req, res, next) {
			next();
		};
	}

	// open and read all JAR files
	const jars = await Promise.all(
		files
			.filter((file) => {
				return file.endsWith(".jar");
			})
			.map(async (file) => {
				const startTime = Date.now();
				if (isDebug) {
					log.info(`  - Found JAR file ${file}`);
				}
				const data = await readFileAsync(file);
				const content = await JSZip.loadAsync(data);
				return {
					file: file,
					content: content,
					startTime: startTime,
				};
			})
	);

	// read the resources of the JAR files
	let jarResources = {};
	await Promise.all(
		jars.map(async (jar) => {
			await Promise.all(
				Object.keys(jar.content.files)
					.filter((entry) => {
						return entry.startsWith(jarRootPath) && !entry.endsWith("/");
					})
					.map(async (entry) => {
						jarResources[entry] = await jar.content.file(entry).async("string");
					})
			);
			if (isDebug) {
				log.info(`  - Loading JAR file ${jar.file} took ${Date.now() - jar.startTime}ms`);
			}
		})
	);

	return async function serveWebJARs(req, res, next) {
		const pathname = req.url?.match("^[^?]*")[0];
		const jarPath = path.join(jarRootPath, pathname.substr(1));

		const jarResource = jarResources[jarPath];
		if (jarResource) {
			if (isDebug) {
				log.info(`Serving ${pathname}`);
			}

			// determine content-type
			let { contentType } = middlewareUtil.getMimeInfo(pathname);
			if (pathname.endsWith(".properties")) {
				contentType = "text/plain";
			}
			res.setHeader("Content-Type", contentType);

			res.send(jarResource);
			res.end();
		} else {
			next();
		}
	};
};
