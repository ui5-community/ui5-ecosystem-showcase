/* eslint-disable no-unused-vars */
const { readFile } = require("fs").promises;
const path = require("path");

const { Resource } = require("@ui5/fs");
const mustache = require("mustache");
const HTMLParser = require("node-html-parser");

let ws = undefined;
let rootDir = undefined;

const swStrategies = {
	offlinePage: "Offline-Page",
	offlineCopyWithBackup: "Offline-Copy-With-Backup-Page",
	offlineCopy: "Offline-Copy",
	preCache: "Cache-First",
	advancedCache: "Advanced-Caching",
};

let default_manifest = {
	short_name: "MyApp",
	name: "My App Title",
	description: "Test App for PWA",
	icons: [
		{
			src: "/images/icons/192x192.png",
			type: "image/png",
			sizes: "192x192",
		},
		{
			src: "/images/icons/512x512.png",
			type: "image/png",
			sizes: "512x512",
		},
	],
	start_url: "/index.html",
	scope: "/",
	background_color: "#EFF4F9",
	theme_color: "#3F5161",
	display: "standalone",
};

/**
 * UI5 PWA enabler
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ workspace, dependencies, options: { projectName, projectNamespace, configuration } }) {
	ws = workspace;
	rootDir = "/resources/" + projectNamespace;
	if (!configuration) {
		throw "Configuration is missing";
	}
	switch (configuration.serviceWorker.strategy) {
		case swStrategies.offlinePage:
			await addOfflinePageSw(configuration.serviceWorker);
			break;
		case swStrategies.offlineCopy:
			await addOfflineCopySw();
			break;
		case swStrategies.offlineCopyWithBackup:
			await addOfflineCopyBackupSw(configuration.serviceWorker);
			break;
		case swStrategies.preCache:
			await addCacheFirstSw(configuration.serviceWorker);
			break;
		case swStrategies.advancedCache:
			await addAdvancedCachingSw(configuration.serviceWorker);
			break;
		default:
			throw "Unknown service worker strategy";
	}
	await addServiceworkerRegistration();
	await addManifest(configuration.manifest);
};

/**
 * Adds the script tag required to register a service worker to the index.html, the added code will register
 * service-worker.js as the service worker for this website.
 *
 * @returns {Promise<undefined>}
 */
async function addServiceworkerRegistration() {
	let fileContent = await readFile(path.join(__dirname, "../templates/register-sw.js"), { encoding: "utf-8" });
	await appendToIndexHtmlHead("<script>" + fileContent.toString() + "</script>");
}

/**
 * Writes a new file using the DuplexCollection provided by the caller of this module
 *
 * @param {object} parameters Parameters
 * @param {string} parameters.path The path to the resource that should be written
 * @param {string|buffer} parameters.content The content to write to the file
 * @returns {Promise} which resolves once the data has been written
 */
function writeFile({ path, content }) {
	if (typeof content === "string") {
		return ws.write(new Resource({ path: path, string: content }));
	} else {
		return ws.write(new Resource({ path: path, buffer: content }));
	}
}

/**
 * Takes the template for the offlinePage service worker and fills it with the values provided in parameters
 *
 * @param {object} parameters Parameters
 * @param {string} parameters.offlinePage Path to the file that will be used as offline page
 * @returns {Promise<undefined>}
 */
async function addOfflinePageSw(parameters) {
	await renderServiceWorker(path.join(__dirname, "../templates/offlinePage.js"), parameters);
}

/**
 * Copies the service worker template for the OfflineCopy service worker, no templating needs to be done
 *
 * @returns {Promise<undefined>}
 */
async function addOfflineCopySw() {
	await renderServiceWorker(path.join(__dirname, "../templates/offlineCopy.js"), {});
}

/**
 * Takes the template for the offlineCopyWithBackup service worker and fills it with the values provided in parameters
 *
 * @param {object} parameters Parameters
 * @param {string} parameters.offlinePage Path to the file that will be used as offline page
 * @returns {Promise<undefined>}
 */
async function addOfflineCopyBackupSw(parameters) {
	await renderServiceWorker(path.join("../templates/offlineCopyWithBackup.js"), parameters);
}

/**
 * Takes the template for the cacheFirst service worker and fills it with the values provided in parameters
 *
 * @param {object} parameters Parameters
 * @param {string} parameters.preCache Path to the file that will be used as offline page
 * @returns {Promise<undefined>}
 */
async function addCacheFirstSw(parameters) {
	// We need to prefix the pattern with our rootDir
	let globPattern = [];
	for (let i = 0; i < parameters.preCache.length; i++) {
		let pattern = undefined;
		// Check for leading slash before concatenating paths
		if (parameters.preCache[i][0] === "/") {
			pattern = rootDir + parameters.preCache[i];
		} else {
			pattern = rootDir + "/" + parameters.preCache[i];
		}
		globPattern.push(pattern);
	}
	// Get all resources that match the pattern and make them into a nice list
	let resources = await ws.byGlob(globPattern);
	let fileList = "";
	for (let i = 0; i < resources.length; i++) {
		// Remove prefix
		let path = resources[i].getPath().replace(rootDir, "");
		fileList = fileList + '\n"' + path + '",';
	}
	// Write the service worker
	await renderServiceWorker(path.join(__dirname, "../templates/cacheFirst.js"), { preCache: fileList });
}

/**
 * Takes the template for the advancedCache service worker and fills it with the values provided in parameters
 *
 * @param {object} parameters Parameters
 * @param {string} parameters.preCache Path to the file that will be used as offline page
 * @param {string} parameters.networkFirst Path to the file that will be used as offline page
 * @param {string} parameters.avoidCaching Path to the file that will be used as offline page
 * @param {string} parameters.offlinePage Path to the file that will be used as offline page
 * @returns {Promise<undefined>}
 */
async function addAdvancedCachingSw(parameters) {
	// First collect the pre cache files
	// We need to prefix the pattern with our rootDir
	let globPattern = [];
	for (let i = 0; i < parameters.preCache.length; i++) {
		let pattern = undefined;
		// Check for leading slash before concatenating paths
		if (parameters.preCache[i][0] === "/") {
			pattern = rootDir + parameters.preCache[i];
		} else {
			pattern = rootDir + "/" + parameters.preCache[i];
		}
		globPattern.push(pattern);
	}
	// Get all resources that match the pattern and make them into a nice list
	let resources = await ws.byGlob(globPattern);
	let preCache = "";
	for (let i = 0; i < resources.length; i++) {
		// Remove prefix
		let path = resources[i].getPath().replace(rootDir, "");
		preCache = preCache + '\n"' + path + '",';
	}
	// Concatenate all regular expressions for networkFirst
	let networkFirst = "";
	for (let i = 0; i < parameters.networkFirst.length; i++) {
		networkFirst = networkFirst + '\n"' + parameters.networkFirst[i] + '",';
	}
	// Concatenate all regular expressions for networkFirst
	let avoidCaching = "";
	for (let i = 0; i < parameters.avoidCaching.length; i++) {
		avoidCaching = avoidCaching + '\n"' + parameters.avoidCaching[i] + '",';
	}
	// Write the service worker
	await renderServiceWorker(path.join(__dirname, "../templates/advancedCache.js"), {
		offlinePage: parameters.offlinePage,
		preCache: preCache,
		networkFirst: networkFirst,
		avoidCaching: avoidCaching,
	});
}

/**
 * Utility function to easily write the service worker
 *
 * @param {string} serviceWorkerTemplate path to the service worker template file
 * @param {object} view will be passed to mustache.render to read values from it
 * @returns {Promise<undefined>}
 */
async function renderServiceWorker(serviceWorkerTemplate, view) {
	let path = rootDir + "/service-worker.js";
	let swCode = await readFile(serviceWorkerTemplate, { encoding: "utf-8" });
	view.timestamp = new Date().getTime().toString();
	swCode = mustache.render(swCode.toString(), view);
	await writeFile({ path: path, content: swCode });
}

/**
 * This function appends the given string representation of an html element to the <head> element of the
 * index.html
 *
 * @param {string} element The string representation of the element that should be injected
 * @returns {Promise} resolving once the data has been written
 */
async function appendToIndexHtmlHead(element) {
	let resource = await ws.byPath(rootDir + "/index.html");
	let indexHtmlContent = await resource.getString();
	let doc = new HTMLParser.parse(indexHtmlContent);
	// Get the head node and append the parsed element:
	//                       <html>            <head>
	let head = doc.getElementsByTagName("head")[0];
	head.appendChild(HTMLParser.parse(element));
	indexHtmlContent = doc.toString();
	resource.setString(indexHtmlContent);
	await ws.write(resource);
}

/**
 * Merges default_manifest with given manifest from your-sapui5-app/ui5.yaml
 * No nested merge e.g. if type in icons is missing it will not be filled with default type.
 * But if icons as a whole is missing it will be filled with default icons.
 * And adds manifest-link to index.html
 *
 * @param {object} manifestConfig Every parameter supplied will override the corresponding default value.
 */
async function addManifest(manifestConfig) {
	let manifest = Object.assign(default_manifest, manifestConfig); //default_manifest will be overidden
	await writeFile({ path: rootDir + "/manifest.webmanifest", content: JSON.stringify(manifest) });
	await appendToIndexHtmlHead('<link rel="manifest" href="manifest.webmanifest">');
	if (!manifestConfig.icons) {
		//if no icons are provided use default icons
		let icon192 = await readFile(path.join(__dirname, "../default_icon/192x192.png"));
		await writeFile({
			path: rootDir + "/images/icons/192x192.png",
			content: icon192,
		});
		let icon512 = await readFile(path.join(__dirname, "../default_icon/512x512.png"));
		await writeFile({
			path: rootDir + "/images/icons/512x512.png",
			content: icon512,
		});
	}
}

/**
 * Callback function to define the list of required dependencies
 *
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set();
};
