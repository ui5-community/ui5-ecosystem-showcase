const { default: test } = require("ava");
const path = require("path");
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { rollup } = require("rollup");
const importMeta = require("../lib/rollup-plugin-import-meta");

const packageName = "import-meta-worker-fixture";
const workerName = "maplibre-gl-worker";
const workerCode = 'self.postMessage("worker-ready");\n';

// eslint-disable-next-line jsdoc/require-jsdoc
function createFixture(t, extension) {
	const cwd = t.context.tmpDir;
	const packageRoot = path.join(cwd, "node_modules", packageName);
	mkdirSync(path.join(packageRoot, "generated"), { recursive: true });
	writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "import-meta-test", version: "1.0.0", private: true, dependencies: { [packageName]: "1.0.0" } }));
	writeFileSync(path.join(packageRoot, "package.json"), JSON.stringify({ name: packageName, version: "1.0.0", main: "entry.js" }));
	const assetSpecifier = `./generated/${workerName}${extension}`;
	const assetPath = path.join(packageRoot, "generated", `${workerName}${extension}`);
	const entryPath = path.join(packageRoot, "entry.js");
	const entryCode = `export const workerUrl = new URL(${JSON.stringify(assetSpecifier)}, import.meta.url);\nexport const worker = new Worker(workerUrl, { type: "module" });\n`;
	writeFileSync(assetPath, workerCode);
	writeFileSync(entryPath, entryCode);
	return { cwd, assetSpecifier, assetPath, entryPath, entryCode };
}

// eslint-disable-next-line jsdoc/require-jsdoc
function createProject(cwd) {
	return {
		getRootPath: () => cwd,
		getName: () => "import-meta-test",
		getVersion: () => "1.0.0",
		getNamespace: () => "test/app",
		getType: () => "application",
		getFrameworkName: () => "OpenUI5",
		getFrameworkVersion: () => "1.120.0",
		getReader: () => ({}),
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
function createLog() {
	return Object.fromEntries(["silly", "verbose", "perf", "info", "warn", "error", "silent"].map((level) => [level, () => {}]));
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function request(middleware, url) {
	return new Promise((resolve, reject) => {
		const res = {
			statusCode: 200,
			setHeader: () => {},
			end: (body) => resolve({ statusCode: res.statusCode, body }),
		};
		middleware({ url }, res, () => resolve({ next: true })).catch(reject);
	});
}

test.beforeEach((t) => {
	t.context.tmpDir = mkdtempSync(path.join(tmpdir(), "ui5-import-meta-"));
});

test.afterEach.always((t) => {
	rmSync(t.context.tmpDir, { recursive: true, force: true });
});

for (const extension of [".js", ".mjs", ".cjs"]) {
	for (const query of ["", "?inject-esmodule"]) {
		for (const virtual of [false, true]) {
			test(`transform ${extension} asset (query=${Boolean(query)}, virtual=${virtual})`, async (t) => {
				const fixture = createFixture(t, extension);
				const emitted = [];
				const transformed = await importMeta().transform.call(
					{
						resolve: async (specifier, importer) => {
							t.is(specifier, fixture.assetSpecifier);
							t.is(importer, fixture.entryPath);
							return { id: `${virtual ? "\0" : ""}${fixture.assetPath}${query}` };
						},
						emitFile: (chunk) => {
							emitted.push(chunk);
							return "worker-reference";
						},
					},
					fixture.entryCode,
					fixture.entryPath,
				);
				t.deepEqual(emitted, [{ type: "prebuilt-chunk", fileName: `${workerName}.js`, code: workerCode }]);
				t.is(transformed, fixture.entryCode.replace(JSON.stringify(fixture.assetSpecifier), JSON.stringify(`${workerName}.js`)));
			});
		}

		test(`Rollup bundles ${extension} asset ${query ? "with query" : "without query"}`, async (t) => {
			const fixture = createFixture(t, extension);
			const bundle = await rollup({
				input: fixture.entryPath,
				plugins: [
					{
						name: "fixture-asset-resolver",
						resolveId(source) {
							return source === fixture.assetSpecifier ? `${fixture.assetPath}${query}` : null;
						},
					},
					importMeta(),
				],
			});
			try {
				const { output } = await bundle.generate({ format: "amd", amd: { define: "sap.ui.define" } });
				const entry = output.find((chunk) => chunk.isEntry);
				const worker = output.find((chunk) => chunk.fileName === `${workerName}.js`);
				t.is(worker?.code, workerCode);
				t.true(entry.code.includes(`new URL("${workerName}.js",`));
				t.true(entry.code.includes('type: "module"'));
				t.false(entry.code.includes("?inject-esmodule"));
				t.false(output.some((chunk) => /\.(?:m|c)js$|\.\.js$/.test(chunk.fileName)));
			} finally {
				await bundle.close();
			}
		});
	}
}

test("leave an unresolved asset unchanged", async (t) => {
	const fixture = createFixture(t, ".js");
	const transformed = await importMeta().transform.call({ resolve: async () => null, emitFile: () => t.fail("An unresolved asset must not be emitted") }, fixture.entryCode, fixture.entryPath);
	t.is(transformed, null);
});

test("report the actual path when the resolved asset is missing", async (t) => {
	const fixture = createFixture(t, ".mjs");
	const missingPath = path.join(t.context.tmpDir, "missing-worker.mjs");
	const error = await t.throwsAsync(
		() => importMeta().transform.call({ resolve: async () => ({ id: missingPath }), emitFile: () => t.fail("A missing asset must not be emitted") }, fixture.entryCode, fixture.entryPath),
		{ code: "ENOENT" },
	);
	t.is(error.path, missingPath);
});

for (const extension of [".js", ".mjs"]) {
	test(`task writes ${extension} worker as a single-extension .js resource`, async (t) => {
		const fixture = createFixture(t, extension);
		const resources = new Map();
		await require("../lib/task")({
			log: createLog(),
			workspace: {
				byGlob: async () => [],
				byPath: async (resourcePath) => resources.get(resourcePath),
				write: async (resource) => resources.set(resource.getPath(), resource),
			},
			taskUtil: {
				getProject: () => createProject(fixture.cwd),
				getDependencies: () => [],
				resourceFactory: { createResource: ({ path: resourcePath, string }) => ({ getPath: () => resourcePath, getString: async () => string }) },
			},
			options: { projectNamespace: "test/app", configuration: { entryPoints: [packageName], addToNamespace: false, skipCache: true, persistentCache: false } },
		});
		t.is(await resources.get(`/resources/${workerName}.js`)?.getString(), workerCode);
		t.false(Array.from(resources.keys()).some((name) => /\.(?:m|c)js$|\.\.js$/.test(name)));
		const entryCode = await resources.get(`/resources/${packageName}.js`)?.getString();
		t.true(entryCode.includes(`new URL("${workerName}.js",`));
	});

	test(`middleware serves ${extension} worker using the emitted .js filename`, async (t) => {
		const fixture = createFixture(t, extension);
		const middleware = await require("../lib/middleware")({
			log: createLog(),
			resources: { rootProject: {} },
			options: { configuration: { watch: false, persistentCache: false, addToNamespace: false, entryPoints: [packageName] } },
			middlewareUtil: {
				getProject: () => createProject(fixture.cwd),
				getDependencies: () => [],
				resourceFactory: { createReaderCollection: () => ({ byGlob: async () => [] }) },
				getMimeInfo: () => ({ contentType: "application/javascript", type: "application/javascript" }),
			},
		});
		const entry = await request(middleware, `/resources/${packageName}.js`);
		t.is(entry.statusCode, 200);
		t.true(entry.body.includes(`new URL("${workerName}.js",`));
		const worker = await request(middleware, `/resources/${workerName}.js`);
		t.deepEqual(worker, { statusCode: 200, body: workerCode });
	});
}
