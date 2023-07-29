const test = require("ava");
const path = require("path");

const cwd = process.cwd();
test.beforeEach(async (t) => {
	const log = (t.context.log = { logs: [] });
	["silly", "verbose", "perf", "info", "warn", "error", "silent"].forEach((level) => {
		log[level] = function (...messages) {
			log.logs.push(`[${level}] ${messages}`);
		};
	});
	t.context.util = require("../lib/util")(log);
});
test.afterEach.always(async (/*t*/) => {
	process.chdir(cwd);
});

test("simple creation of babel config", async (t) => {
	const config = await t.context.util.createBabelConfig({
		configuration: {
			debug: true
		}
	});
	t.true(config !== undefined);
});

test("usage of external babel config", async (t) => {
	process.chdir(path.join(__dirname, "__assets__/external"));
	const config = await t.context.util.createBabelConfig({
		configuration: {
			debug: true
		}
	});
	t.true(config !== undefined);
});

test("inject configuration options", async (t) => {
	process.chdir(path.join(__dirname, "__assets__/typescript"));

	// typescript, default config
	let configuration = t.context.util.createConfiguration({
		debug: true
	});
	let babelConfig = await t.context.util.createBabelConfig({ configuration });
	t.deepEqual(babelConfig, {
		ignore: ["**/*.d.ts"],
		plugins: [],
		presets: [
			[
				"@babel/preset-env",
				{
					targets: {
						browsers: "defaults"
					}
				}
			],
			"transform-ui5",
			"@babel/preset-typescript"
		],
		sourceMaps: true
	});

	// typescript, custom transform-ui5 config
	configuration = t.context.util.createConfiguration({
		debug: true,
		transformModulesToUI5: {
			overridesToOverride: true
		}
	});
	babelConfig = await t.context.util.createBabelConfig({ configuration });
	t.deepEqual(babelConfig, {
		ignore: ["**/*.d.ts"],
		plugins: [],
		presets: [
			[
				"@babel/preset-env",
				{
					targets: {
						browsers: "defaults"
					}
				}
			],
			[
				"transform-ui5",
				{
					overridesToOverride: true
				}
			],
			"@babel/preset-typescript"
		],
		sourceMaps: true
	});

	// typescript, custom typescript and transform-ui5 config
	configuration = t.context.util.createConfiguration({
		debug: true,
		transformTypeScript: {
			optimizeConstEnums: true
		},
		transformModulesToUI5: {
			overridesToOverride: true
		}
	});
	babelConfig = await t.context.util.createBabelConfig({ configuration });
	t.deepEqual(babelConfig, {
		ignore: ["**/*.d.ts"],
		plugins: [],
		presets: [
			[
				"@babel/preset-env",
				{
					targets: {
						browsers: "defaults"
					}
				}
			],
			[
				"transform-ui5",
				{
					overridesToOverride: true
				}
			],
			[
				"@babel/preset-typescript",
				{
					optimizeConstEnums: true
				}
			]
		],
		sourceMaps: true
	});
});
