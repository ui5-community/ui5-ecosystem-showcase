const test = require("ava");
const path = require("path");
const crypto = require("crypto");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { platform } = require("os");

// *****************************************************************************
// HELPERS START HERE!
// *****************************************************************************

// eslint-disable-next-line jsdoc/require-jsdoc
async function getResource(resourceName, ctx, options = {}) {
	return ctx.util.getResource(resourceName, { skipCache: true, debug: true, ...options });
}

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
	const fn = new Function(["scope"], `// ${resourceName}\nObject.keys(scope).forEach(sym => { globalThis[sym] = scope[sym]; });\nconst window = self = global = globalThis;\n${code}`);
	return new Promise((resolve) => {
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
									let exports = callback.apply(undefined, resolvedDeps);
									let exportsIndex = deps.indexOf("exports");
									exports = exportsIndex !== -1 ? resolvedDeps[exportsIndex] : exports;
									resolve(exports);
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
async function getModule(resourceName, ctx, options = {}) {
	if (resourceName?.startsWith("..")) {
		throw Error("Paths must be resolved relative to resource!");
	}
	if (resourceName === "exports") {
		return {};
	}
	if (resourceName === "require") {
		return function () {};
	}
	const resource = await getResource(resourceName, ctx, options);
	writeFile(resourceName, resource.code, ctx);
	const retVal = await runModule(resourceName, resource.code, ctx);
	return {
		name: resourceName,
		code: resource.code,
		retVal,
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
		t.log(t.context.log.logs);
	}
	if (!generateSnapshots) {
		rmSync(t.context.tmpDir, { recursive: true, force: true });
	}
	process.chdir(cwd);
});

test.serial("Verify generation of @stomp/stompjs", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule("@stomp/stompjs", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of jspdf", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule("jspdf", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
		scope: {
			navigator: {},
		},
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of luxon", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule("luxon", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of XLSX", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule("xlsx", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of moment", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule("moment", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of cmis", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("cmis", {
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
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

/*
 * HINTS: firebase requires node-fetch@^2.6.9
 */
test.serial("Verify generation of ui5-app/bundledefs/firebase", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("ui5-app/bundledefs/firebase", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
		scope: {
			fetch: function () {},
		},
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @supabase/supabase-js", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("@supabase/supabase-js", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
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
	const module = await getModule("@octokit/core", {
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
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of axios", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("axios", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @js-temporal/polyfill", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("@js-temporal/polyfill", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of ui5-app/bundledefs/react", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("ui5-app/bundledefs/react", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of zod", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-app"));
	const module = await getModule("zod", {
		tmpDir: t.context.tmpDir,
		util: t.context.util,
	});
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});

test.serial("Verify generation of @luigi-project/container", async (t) => {
	process.chdir(path.resolve(cwd, "../../showcases/ui5-tsapp"));
	const module = await getModule(
		"@luigi-project/container",
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
	t.true(module.retVal.__esModule);
	if (platform() !== "win32") {
		t.is(module.code, readSnapFile(module.name, t.context.snapDir));
	}
});
