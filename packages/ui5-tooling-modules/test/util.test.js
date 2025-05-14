const test = require("ava");
const path = require("path");
const { createHash, randomBytes } = require("crypto");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { platform } = require("os");
const { runInContext, createContext } = require("vm");

// *****************************************************************************
// HELPERS START HERE!
// *****************************************************************************

// eslint-disable-next-line jsdoc/require-jsdoc
function createShortHash(title) {
	return createHash("shake256", { outputLength: 4 }).update(title).digest("hex");
}

// eslint-disable-next-line jsdoc/require-jsdoc
function readSnapFile(resourceName, snapDir) {
	const file = path.join(snapDir, `${resourceName}.js`);
	return readFileSync(file, { encoding: "utf8" });
}

// eslint-disable-next-line jsdoc/require-jsdoc
function writeFile(resourceName, code, ctx) {
	const file = path.join(ctx.tmpDir, `${resourceName}.js`);
	const dir = path.dirname(file);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(file, code, { encoding: "utf8" });
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function runModule(resourceName, code, ctx) {
	return new Promise((resolve, reject) => {
		const context = createContext(
			Object.assign({}, ctx.scope, {
				sap: {
					ui: {
						define: async function (name, deps, callback) {
							if (typeof name === "function") {
								callback = name;
								name = undefined;
							} else if (Array.isArray(name)) {
								callback = deps;
								deps = name;
								name = undefined;
							}
							if (Array.isArray(deps)) {
								const resolvedDeps = await Promise.all(
									deps.map((dep) => getModule(/exports|require/.test(dep) ? dep : /^\.\.?\//.test(dep) ? path.join(resourceName, "..", dep) : dep, ctx)),
								);
								try {
									// INFO: put a breakpoint into the next line and the set the breakpoint for
									//       "Caught Exceptions". This will let you stop where the error occurs!
									let exports = callback.apply(
										undefined,
										resolvedDeps.map((dep) => dep.retVal),
									);
									let exportsIndex = deps.indexOf("exports");
									exports = exportsIndex !== -1 ? resolvedDeps[exportsIndex].retVal : exports;
									resolve(exports);
								} catch (err) {
									let { row } = /<anonymous>:(?<row>\d+):(?<col>\d+)/.exec(err.stack).groups;
									row -= 4; // remove the six rows appended above
									const codeLines = code.split("\n");
									const beginRow = Math.max(0, row - 10);
									const endRow = Math.min(codeLines.length - 1, beginRow + 20);
									const codeSnippet = [];
									for (let i = beginRow, l = endRow; i < l; i++) {
										const lineNo = `[${i}]`.padEnd(`${endRow}`.length + 3);
										if (i == row) {
											codeSnippet.push(`${lineNo} >>>\t${codeLines[i]?.substring(0, 80)}${codeLines[i]?.length > 80 ? "..." : ""}`);
										} else {
											codeSnippet.push(`${lineNo}    \t${codeLines[i]?.substring(0, 80)}${codeLines[i]?.length > 80 ? "..." : ""}`);
										}
									}
									console.error(`The following line caused the issue "${err.message}":\n\n${codeSnippet.join("\n")}\n\n`, err);
									reject(err);
								}
							} else {
								resolve(callback.apply(undefined));
							}
						},
					},
				},
			}),
		);
		runInContext(`// ${resourceName}\n${ctx?.monkeyPatch || ""}\nconst window = self = global = globalThis;\n${code}`, context);
	});
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function getModule(resourceName, ctx) {
	if (resourceName?.startsWith("..")) {
		throw Error("Paths must be resolved relative to resource!");
	}
	if (resourceName === "exports") {
		return { retVal: {} };
	}
	if (resourceName === "require") {
		return { retVal: function () {} };
	}
	if (resourceName?.startsWith(ctx.localResourcesNamespace)) {
		resourceName = resourceName.substring(ctx.localResourcesNamespace.length + 1);
	}
	const resource = ctx.bundleInfo.getEntry(resourceName);
	if (resource) {
		if (!existsSync(path.join(snapDir, ctx.hash, `${resourceName}.js`))) {
			writeFile(
				resourceName,
				resource.code,
				Object.assign(ctx, {
					tmpDir: path.join(snapDir, ctx.hash),
				}),
			);
		}
		writeFile(resourceName, resource.code, ctx);
		const retVal = await runModule(resourceName, resource.code, ctx);
		return {
			name: resourceName,
			code: resource.code,
			retVal,
		};
	} else {
		const mockedModule = ctx.modules?.[resourceName];
		if (mockedModule) {
			return {
				name: resourceName,
				code: "<mocked>",
				retVal: mockedModule,
			};
		} else {
			// external module
			console.warn(`External module "${resourceName}" is not found!`);
			return {
				name: resourceName,
				code: "<external>",
				retVal: {
					/* empty module */
				},
			};
		}
	}
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function getProjectInfo(cwd = process.cwd()) {
	const { graphFromPackageDependencies } = await import("@ui5/project/graph");
	const graph = await graphFromPackageDependencies({
		cwd,
		workspaceName: "default",
	});
	const pkgJsonPath = process.env.npm_package_json || path.join(cwd, "package.json");
	const project = graph.getRoot();
	const projectInfo = {
		name: project.getName(),
		version: project.getVersion(),
		namespace: project.getNamespace(),
		type: project.getType(),
		rootPath: project.getRootPath(),
		framework: {
			name: project.getFrameworkName(),
			version: project.getFrameworkVersion(),
		},
		pkgJsonPath,
		pkgJson: require(pkgJsonPath),
	};
	return projectInfo;
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function setupEnv(resourceName, ctx, config = {}, options = {}) {
	const projectInfo = await getProjectInfo(ctx.cwd || process.cwd());
	const localResourcesNamespace = path.posix.join(projectInfo.namespace, "resources");
	ctx.localResourcesNamespace = localResourcesNamespace;
	const util = require("../lib/util")(ctx.log, projectInfo);
	const bundleInfo = await util.getBundleInfo(resourceName, Object.assign({ skipCache: true, debug: true }, config), options);
	if (bundleInfo.error) {
		throw new Error(bundleInfo.error);
	}
	return {
		getModule: function (resourceName) {
			return getModule(resourceName, Object.assign({ bundleInfo }, ctx));
		},
	};
}

// *****************************************************************************
// TESTS START HERE!
// *****************************************************************************

const cwd = process.cwd();
const snapDir = path.resolve(cwd, `test/__snap__`);
const generateSnapshots = process.argv.slice(2).indexOf("--generateSnapshots") !== -1;
if (generateSnapshots) {
	rmSync(snapDir, { recursive: true, force: true });
}

test.beforeEach(async (t) => {
	t.context.hash = createShortHash(t.title);
	t.context.tmpDir = path.resolve(cwd, generateSnapshots ? `test/__snap__` : `test/__dist__/${randomBytes(5).toString("hex")}`);
	t.context.snapDir = path.join(snapDir, t.context.hash);
	const log = (t.context.log = { logs: [] });
	["silly", "verbose", "perf", "info", "warn", "error", "silent"].forEach((level) => {
		log[level] = function (...messages) {
			log.logs.push(`[${level}] ${messages}`);
		};
	});
	console.log(`Running test "${t.title.substr(20)}" ("${t.context.hash}")...`);
});
test.afterEach.always(async (t) => {
	if (!t.passed) {
		// TODO: t.log(t.context.log.logs);
	}
	if (!generateSnapshots) {
		rmSync(t.context.tmpDir, { recursive: true, force: true });
	}
	process.chdir(cwd);
});

test.serial("Verify generation of @stomp/stompjs", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["@stomp/stompjs"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("@stomp/stompjs");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir, createShortHash(t.title)));
	}
});

test.serial("Verify generation of chart.js/auto", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["chart.js/auto"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("chart.js/auto");
	t.true(typeof module.retVal === "function");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir, createShortHash(t.title)));
	}
});

test.serial("Verify generation of jspdf", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(
		["jspdf"],
		{
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			scope: {
				navigator: {},
				atob: function () {},
				btoa: function () {},
			},
		},
		{
			chunksPath: "../_chunks_/../",
		},
	);
	const module = await env.getModule("jspdf");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of luxon", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["luxon"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("luxon");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of XLSX", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["xlsx"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("xlsx");
	t.true(module.retVal.__esModule);
	t.true(typeof module.retVal.version === "string");
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of moment", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["moment"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("moment");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of cmis", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["cmis"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			atob: function () {},
			btoa: function () {},
			fetch: function () {},
			XMLHttpRequest: function () {
				return { open: function () {} };
			},
			location: {
				host: "/",
			},
			TextEncoder: function () {},
			TextDecoder: function () {},
		},
	});
	const module = await env.getModule("cmis");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

/*
 * HINTS: firebase requires node-fetch@^2.6.9
 * @deprecated bundledefs are not officially supported / needed anymore
 */
test.serial("Verify generation of ui5-app/bundledefs/firebase", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["ui5-app/bundledefs/firebase"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			fetch: function () {},
			XMLHttpRequest: function () {
				return { open: function () {} };
			},
			location: {
				host: "/",
			},
			http2: {
				constants: {
					HTTP2_HEADER_AUTHORITY: "HTTP2_HEADER_AUTHORITY",
				},
			},
		},
	});
	const firebase = await env.getModule("ui5-app/bundledefs/firebase");
	t.true(firebase.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(firebase.code, readSnapFile(firebase.name, t.context.snapDir));
	}
});

/*
 * HINTS: firebase requires node-fetch@^2.6.9
 */
test.serial("Verify generation of firebase/firestore", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		[
			"firebase/app", // requires node-fetch@2
			"firebase/firestore/lite",
		],
		{
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			scope: {
				fetch: function () {},
				XMLHttpRequest: function () {
					return { open: function () {} };
				},
				location: {
					host: "/",
				},
				http2: {
					constants: {
						HTTP2_HEADER_AUTHORITY: "HTTP2_HEADER_AUTHORITY",
					},
				},
			},
		},
	);
	const firebase = await env.getModule("firebase/app");
	t.true(firebase.retVal.__esModule);
	t.true(typeof firebase.retVal.initializeApp === "function");
	if (platform() !== "win32") {
		t.is(firebase.code, readSnapFile(firebase.name, t.context.snapDir));
	}
	const firestore = await env.getModule("firebase/firestore/lite");
	t.true(firestore.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(firestore.code, readSnapFile(firestore.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @supabase/supabase-js", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["@supabase/supabase-js"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			WebSocket: function () {},
			fetch: function () {},
		},
	});
	const module = await env.getModule("@supabase/supabase-js");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

/*
 * HINTS: octokit/core requires node-fetch@^2.6.9 ans is-plain-object@^5.0.0
 */
test.serial("Verify generation of @octokit/core", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["@octokit/core"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			fetch: function () {},
			XMLHttpRequest: function () {
				return { open: function () {} };
			},
			location: {
				host: "/",
			},
		},
	});
	const module = await env.getModule("@octokit/core");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of axios", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["axios"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			XMLHttpRequest: function () {
				return { open: function () {} };
			},
			location: {
				host: "/",
			},
		},
	});
	const module = await env.getModule("axios");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @js-temporal/polyfill", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["@js-temporal/polyfill"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("@js-temporal/polyfill");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of react/reactdom", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["react", "react-dom/client"],
		{
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
		},
		{
			chunksPath: true,
		},
	);
	const react = await env.getModule("react");
	t.true(react.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(react.code, readSnapFile(react.name, t.context.snapDir));
	}
	const reactdom = await env.getModule("react-dom/client");
	t.true(reactdom.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(reactdom.code, readSnapFile(reactdom.name, t.context.snapDir));
	}
});

test.serial("Verify generation of zod", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["zod"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
	});
	const module = await env.getModule("zod");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @luigi-project/container", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(
		["@luigi-project/container", "@luigi-project/container/LuigiContainer"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			keepDynamicImports: ["@luigi-project/container"],
		},
	);
	const modPackage = await env.getModule("@luigi-project/container");
	t.true(modPackage.retVal._ui5metadata.name === "@luigi-project/container");
	const modContainer = await env.getModule("@luigi-project/container/LuigiContainer");
	t.true(modContainer.retVal.name === "@luigi-project.container.LuigiContainer");
	if (platform() !== "win32") {
		t.is(modPackage.code, readSnapFile(modPackage.name, t.context.snapDir));
		t.is(modContainer.code, readSnapFile(modContainer.name, t.context.snapDir));
	}
});

test.serial("Verify generation of pdfMake", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["pdfmake/build/pdfmake", "pdfmake/build/vfs_fonts"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			navigator: {},
		},
	});
	const module = await env.getModule("pdfmake/build/pdfmake");
	t.true(module.retVal.__esModule);
	t.true(typeof module.retVal.createPdf === "function");
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
	const moduleFonts = await env.getModule("pdfmake/build/vfs_fonts");
	t.true(moduleFonts.retVal.__esModule);
	t.true(typeof moduleFonts.retVal === "object");
	t.true(Object.keys(moduleFonts.retVal).length > 0);
	if (platform() !== "win32") {
		t.is(moduleFonts.code, readSnapFile(moduleFonts.name, t.context.snapDir));
	}
});

test.serial("Verify generation of xml-js", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["xml-js"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			TextEncoder: function () {},
			TextDecoder: function () {},
		},
	});
	const module = await env.getModule("xml-js");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

const webcomponentsContext = {
	scope: {
		HTMLElement: function () {},
		Element: function () {},
		Node: function () {},
		Event: function () {},
		CSSStyleSheet: function () {
			this.replaceSync = function () {};
		},
		customElements: {
			get: function () {},
			define: function () {},
		},
		navigator: {},
		document: {
			body: {
				insertBefore: function () {},
				appendChild: function () {},
				removeChild: function () {},
			},
			createElement: function () {
				return {
					style: {},
					classList: {
						add: function () {},
					},
					setAttribute: function () {},
				};
			},
			querySelector: function () {},
			createTreeWalker: function () {},
			adoptedStyleSheets: [],
		},
		location: {
			search: "",
		},
		getComputedStyle: function () {
			return {};
		},
		URLSearchParams: function () {
			return {
				forEach: function () {},
			};
		},
	},
	// running Web Components in the V8 engine causes "TypeError: can't redefine non-configurable property design"
	// because the Web Components _generateAccessors doesn't mark the property as configurable
	// => so we simply monkey patch the Object.defineProperty call to get rid of this error during the execution
	monkeyPatch: "Object.defineProperty = function() { if (arguments[2]) { arguments[2].configurable = true; } return this.apply(undefined, arguments); }.bind(Object.defineProperty);",
};

const webcContextModules = {
	"sap/ui/core/Lib": {
		init: function () {
			return {};
		},
	},
	"sap/ui/base/DataType": {
		registerEnum: function () {},
	},
	"sap/ui/core/webc/WebComponent": {
		prototype: {},
		extend: function (name, def) {
			return { name, def };
		},
	},
	"sap/ui/core/webc/WebComponentRenderer": function () {},
	"sap/ui/core/EnabledPropagator": function () {},
	"sap/base/strings/hyphenate": function (s) {
		return s;
	},
};

test.serial("Verify generation of @ui5/webcomponents/dist/Panel", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/dist/Panel"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					skip: true,
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/dist/Panel");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/dist/Panel Wrapper UI5 Control", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/dist/Panel"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					scopeSuffix: "mYsCoPeSuFfIx",
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/dist/Panel");
	t.deepEqual(module.retVal.name, "@ui5.webcomponents.dist.Panel");
	t.deepEqual(module.retVal.def.metadata.tag, "ui5-panel-mYsCoPeSuFfIx");
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/dist/CheckBox", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/dist/CheckBox"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					skip: true,
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/dist/CheckBox");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/dist/CheckBox Wrapper UI5 Control", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/dist/CheckBox"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					scoping: false,
					moduleBasePath: path.posix.join("ui5/ecosystem/demo/app", "any"),
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/dist/CheckBox");
	t.deepEqual(module.retVal.name, "@ui5.webcomponents.dist.CheckBox");
	t.deepEqual(module.retVal.def.metadata.tag, "ui5-checkbox");
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/Button", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/Button"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					skip: true,
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/Button");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/Button Wrapper UI5 Control", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(
		["@ui5/webcomponents/Button"],
		Object.assign({}, webcomponentsContext, {
			hash: t.context.hash,
			tmpDir: t.context.tmpDir,
			log: t.context.log,
			modules: webcContextModules,
		}),
		{
			pluginOptions: {
				webcomponents: {
					scoping: false,
					removeScopePrefix: true,
					moduleBasePath: path.posix.join("ui5/ecosystem/demo/app", "thirdparty"),
				},
			},
		},
	);
	const module = await env.getModule("@ui5/webcomponents/Button");
	t.deepEqual(module.retVal.name, "@ui5.webcomponents.dist.Button");
	t.deepEqual(module.retVal.def.metadata.tag, "ui5-button");
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of signalr/punycode", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const jQuery = function () {
		return { on: function () {} };
	};
	const env = await setupEnv(["signalr", "punycode"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			document: {
				readyState: "",
			},
			navigator: {
				appName: "",
			},
			jQuery,
		},
	});
	const moduleS = await env.getModule("signalr");
	t.true(moduleS.retVal.__esModule);
	t.is(jQuery.connection.name, "signalR");
	const moduleP = await env.getModule("punycode");
	t.true(moduleP.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(moduleS.code, readSnapFile(moduleS.name, t.context.snapDir));
		t.is(moduleP.code, readSnapFile(moduleP.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @opentelemetry", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["@opentelemetry/api", "@opentelemetry/sdk-trace-web"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {
			performance: {},
		},
	});
	const moduleOT_API = await env.getModule("@opentelemetry/api");
	t.true(moduleOT_API.retVal.__esModule);
	t.is(typeof moduleOT_API.retVal.trace, "object");
	const moduleOT_SDK = await env.getModule("@opentelemetry/sdk-trace-web");
	t.true(moduleOT_SDK.retVal.__esModule);
	t.is(typeof moduleOT_SDK.retVal.WebTracerProvider, "function");
	if (platform() !== "win32") {
		t.is(moduleOT_API.code, readSnapFile(moduleOT_API.name, t.context.snapDir));
		t.is(moduleOT_SDK.code, readSnapFile(moduleOT_SDK.name, t.context.snapDir));
	}
});

test.serial("Verify generation of fetch-mock", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["fetch-mock"], {
		hash: t.context.hash,
		tmpDir: t.context.tmpDir,
		log: t.context.log,
		scope: {},
	});
	const fetchMock = await env.getModule("fetch-mock");
	t.true(fetchMock.retVal.__esModule);
	t.is(typeof fetchMock.retVal.config, "object");
	t.is(typeof fetchMock.retVal.fetchHandler, "function");
	if (platform() !== "win32") {
		t.is(fetchMock.code, readSnapFile(fetchMock.name, t.context.snapDir));
	}
});
