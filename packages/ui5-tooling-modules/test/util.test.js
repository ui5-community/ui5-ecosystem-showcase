const test = require("ava");
const path = require("path");
const crypto = require("crypto");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { platform } = require("os");

// *****************************************************************************
// HELPERS START HERE!
// *****************************************************************************

// eslint-disable-next-line jsdoc/require-jsdoc
function readSnapFile(resourceName, snapDir) {
	const file = path.join(snapDir, `${resourceName}.js`);
	return readFileSync(file, { encoding: "utf8" });
}

// eslint-disable-next-line jsdoc/require-jsdoc
function writeFile(resourceName, code, ctx) {
	const file = path.join(ctx.tmpDir, `${resourceName}.js`);
	const dir = path.resolve(file, "../");
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(file, code, { encoding: "utf8" });
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function runModule(resourceName, code, ctx) {
	const fn = new Function(
		["scope"],
		`// ${resourceName}\n${ctx?.monkeyPatch || ""}Object.keys(scope).forEach(sym => { globalThis[sym] = scope[sym]; });\nconst window = self = global = globalThis;\n${code}`
	);
	return new Promise((resolve, reject) => {
		fn(
			Object.assign(
				{},
				{
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
									const resolvedDeps = await Promise.all(deps.map((dep) => getModule(/exports|require/.test(dep) ? dep : path.join(resourceName, "..", dep), ctx)));
									try {
										// INFO: put a breakpoint into the next line and the set the breakpoint for
										//       "Caught Exceptions". This will let you stop where the error occurs!
										let exports = callback.apply(
											undefined,
											resolvedDeps.map((dep) => dep.retVal)
										);
										let exportsIndex = deps.indexOf("exports");
										exports = exportsIndex !== -1 ? resolvedDeps[exportsIndex].retVal : exports;
										resolve(exports);
									} catch (err) {
										let { row } = /<anonymous>:(?<row>\d+):(?<col>\d+)/.exec(err.stack).groups;
										row -= 6; // remove the six rows appended above
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
				},
				ctx?.scope
			)
		);
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
	const resource = ctx.bundleInfo.getEntry(resourceName);
	writeFile(resourceName, resource.code, ctx);
	const retVal = await runModule(resourceName, resource.code, ctx);
	return {
		name: resourceName,
		code: resource.code,
		retVal,
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function setupEnv(resourceName, ctx, options = {}) {
	const bundleInfo = await ctx.util.getBundleInfo(resourceName, { skipCache: true, debug: true }, options);
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
const generateSnapshots = process.argv.slice(2)?.[0] == "--generateSnapshots";
if (generateSnapshots) {
	rmSync(snapDir, { recursive: true, force: true });
}

test.beforeEach(async (t) => {
	t.context.tmpDir = path.resolve(cwd, generateSnapshots ? `test/__snap__` : `test/__dist__/${crypto.randomBytes(5).toString("hex")}`);
	t.context.snapDir = snapDir;
	const log = (t.context.log = { logs: [] });
	["silly", "verbose", "perf", "info", "warn", "error", "silent"].forEach((level) => {
		log[level] = function (...messages) {
			log.logs.push(`[${level}] ${messages}`);
		};
	});
	t.context.util = require("../lib/util")(log);
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	const module = await env.getModule("@stomp/stompjs");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of jspdf", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["jspdf"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
		scope: {
			navigator: {},
		},
	});
	const module = await env.getModule("jspdf");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of luxon", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["luxon"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	const module = await env.getModule("xlsx");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of moment", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const env = await setupEnv(["moment"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
			tmpDir: t.context.tmpDir,
			util: t.context.util,
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
		}
	);
	const firebase = await env.getModule("firebase/app");
	t.true(firebase.retVal.__esModule);
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
		scope: {
			WebSocket: function () {},
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	const module = await env.getModule("@js-temporal/polyfill");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of react/reactdom", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["react", "react-dom/client"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
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
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
		["@luigi-project/container"],
		{
			tmpDir: t.context.tmpDir,
			util: t.context.util,
			scope: {
				HTMLElement: function () {},
				customElements: {
					get: function () {},
					define: function () {},
				},
			},
		},
		{
			keepDynamicImports: ["@luigi-project/container"],
		}
	);
	const module = await env.getModule("@luigi-project/container");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of pdfMake", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["pdfmake/build/pdfmake", "pdfmake/build/vfs_fonts"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
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
	t.true(moduleFonts.retVal.pdfMake !== undefined);
	t.true(Object.keys(moduleFonts.retVal.pdfMake.vfs).length > 0);
	if (platform() !== "win32") {
		t.is(moduleFonts.code, readSnapFile(moduleFonts.name, t.context.snapDir));
	}
});

test.serial("Verify generation of xml-js", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["xml-js"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	const module = await env.getModule("xml-js");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @ui5/webcomponents/dist/Panel", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const env = await setupEnv(["@ui5/webcomponents/dist/Panel"], {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
		scope: {
			HTMLElement: function () {},
			Element: function () {},
			Node: function () {},
			customElements: {
				get: function () {},
				define: function () {},
			},
			navigator: {},
		},
		// running Web Components in the V8 engine causes "TypeError: can't redefine non-configurable property design"
		// because the Web Components _generateAccessors doesn't mark the property as configurable
		// => so we simply monkey patch the Object.defineProperty call to get rid of this error during the execution
		monkeyPatch: "Object.defineProperty = function() { if (arguments[2]) { arguments[2].configurable = true; } return this.apply(undefined, arguments); }.bind(Object.defineProperty);",
	});
	const module = await env.getModule("@ui5/webcomponents/dist/Panel");
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});
