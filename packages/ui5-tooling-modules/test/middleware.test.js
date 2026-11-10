const { default: test } = require("ava");
const path = require("path");
const Module = require("module");

// Replace lib/util with a stub to control the outcome of the bundling (the middleware requires it lazily).
let bundleInfo;
const utilPath = require.resolve("../lib/util");
const utilStub = new Module(utilPath);
utilStub.filename = utilPath;
utilStub.loaded = true;
utilStub.exports = () => ({
	scan: async () => ({ uniqueModules: new Set(["my-lib"]) }),
	getBundleInfo: async () => bundleInfo,
	getResource: () => undefined,
	resolveModule: (moduleName) => (moduleName === "my-lib/package.json" ? "/node_modules/my-lib/package.json" : undefined),
});
require.cache[utilPath] = utilStub;

const createMiddleware = require("../lib/middleware");

// eslint-disable-next-line jsdoc/require-jsdoc
function createBundleInfo(entries, error) {
	return {
		error,
		getEntry: (name) => entries.find((entry) => entry.name === name),
		getRelatedPaths: () => [],
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function request(url) {
	const noop = () => {};
	const project = {
		getRootPath: () => path.resolve(__dirname, ".."),
		getName: () => "my.app",
		getVersion: () => "1.0.0",
		getNamespace: () => "my/app",
		getType: () => "application",
		getFrameworkName: () => "OpenUI5",
		getFrameworkVersion: () => "1.120.0",
		getReader: () => ({}),
	};
	const middleware = await createMiddleware({
		log: { verbose: noop, info: noop, warn: noop, error: noop },
		resources: { rootProject: {} },
		options: { configuration: { watch: false } },
		middlewareUtil: {
			getProject: () => project,
			getDependencies: () => [],
			resourceFactory: { createReaderCollection: () => ({}) },
			getMimeInfo: () => ({ contentType: "application/javascript", type: "application/javascript" }),
		},
	});
	return new Promise((resolve) => {
		const headers = {};
		const res = {
			statusCode: 200,
			setHeader: (name, value) => (headers[name.toLowerCase()] = value),
			end: (body) => resolve({ statusCode: res.statusCode, headers, body }),
		};
		middleware({ url }, res, () => resolve({ next: true }));
	});
}

test.serial("Serve a bundled module", async (t) => {
	bundleInfo = createBundleInfo([{ name: "my-lib", type: "module", code: "sap.ui.define([], () => 42);" }]);
	const { statusCode, body } = await request("/thirdparty/my-lib.js");
	t.is(statusCode, 200);
	t.is(body, "sap.ui.define([], () => 42);");
});

test.serial("Respond with an error instead of an empty 200 when the bundling failed", async (t) => {
	// a failed bundling keeps the module entries which have been registered before bundling (without code)
	bundleInfo = createBundleInfo([{ name: "my-lib", type: "module", path: "/node_modules/my-lib/index.js" }], new Error("EACCES: permission denied, scandir '/srv'"));
	const { statusCode, headers, body } = await request("/thirdparty/my-lib.js");
	t.is(statusCode, 500);
	t.regex(headers["content-type"], /^text\/plain/);
	t.is(body, "Couldn't bundle module my-lib: EACCES: permission denied, scandir '/srv'");
});
