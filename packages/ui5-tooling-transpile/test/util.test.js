const test = require("ava");
const path = require("path");

const cwd = process.cwd();
test.beforeEach(async (/*t*/) => {
	/* nothing to do */
});
test.afterEach.always(async (/*t*/) => {
	process.chdir(cwd);
});

test("simple creation of babel config", async (t) => {
	const util = require("../lib/util");
	const config = await util.createBabelConfig({
		configuration: {
			debug: true
		}
	});
	t.true(config !== undefined);
});

test("usage of external babel config", async (t) => {
	const util = require("../lib/util");
	process.chdir(path.join(__dirname, "__assets__/external"));
	const config = await util.createBabelConfig({
		configuration: {
			debug: true
		}
	});
	t.true(config !== undefined);
});

test("inject configuration options", async (t) => {
	const util = require("../lib/util");
	process.chdir(path.join(__dirname, "__assets__/typescript"));

	// typescript, default config
	let configuration = util.createConfiguration({
		debug: true
	});
	let babelConfig = await util.createBabelConfig({ configuration });
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
	configuration = util.createConfiguration({
		debug: true,
		transformModulesToUI5: {
			overridesToOverride: true
		}
	});
	babelConfig = await util.createBabelConfig({ configuration });
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
	configuration = util.createConfiguration({
		debug: true,
		transformTypeScript: {
			optimizeConstEnums: true
		},
		transformModulesToUI5: {
			overridesToOverride: true
		}
	});
	babelConfig = await util.createBabelConfig({ configuration });
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
