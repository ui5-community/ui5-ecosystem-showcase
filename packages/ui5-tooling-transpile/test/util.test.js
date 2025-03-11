const test = require("ava");
const path = require("path");
const fs = require("fs");
// eslint-disable-next-line no-redeclare
const crypto = require("crypto");

//const cwd = process.cwd();
test.beforeEach(async (t) => {
	const log = (t.context.log = { logs: [] });
	["silly", "verbose", "perf", "info", "warn", "error", "silent"].forEach((level) => {
		log[level] = function (...messages) {
			log.logs.push(`[${level}] ${messages}`);
		};
	});
	t.context.util = require("../lib/util")(log);
});
//test.afterEach.always(async (/*t*/) => {
//	process.chdir(cwd);
//});

test("normalization of babel presets and plugins", (t) => {
	const { normalizePresetOrPlugin } = t.context.util._helpers;
	t.is(normalizePresetOrPlugin("/dir/preset.js", true), "/dir/preset.js");
	t.is(normalizePresetOrPlugin("/dir/plugin.js", false), "/dir/plugin.js");
	t.is(normalizePresetOrPlugin("./dir/preset.js", true), "./dir/preset.js");
	t.is(normalizePresetOrPlugin("./dir/plugin.js", false), "./dir/plugin.js");
	t.is(normalizePresetOrPlugin("mod", true), "babel-preset-mod");
	t.is(normalizePresetOrPlugin("mod", false), "babel-plugin-mod");
	t.is(normalizePresetOrPlugin("mod/preset", true), "mod/preset");
	t.is(normalizePresetOrPlugin("mod/plugin", false), "mod/plugin");
	t.is(normalizePresetOrPlugin("babel-preset-mod", true), "babel-preset-mod");
	t.is(normalizePresetOrPlugin("babel-plugin-mod", false), "babel-plugin-mod");
	t.is(normalizePresetOrPlugin("@babel/mod", true), "@babel/preset-mod");
	t.is(normalizePresetOrPlugin("@babel/mod", false), "@babel/plugin-mod");
	t.is(normalizePresetOrPlugin("@babel/preset-mod", true), "@babel/preset-mod");
	t.is(normalizePresetOrPlugin("@babel/plugin-mod", false), "@babel/plugin-mod");
	t.is(normalizePresetOrPlugin("@babel/mod/preset", true), "@babel/mod/preset");
	t.is(normalizePresetOrPlugin("@babel/mod/plugin", false), "@babel/mod/plugin");
	t.is(normalizePresetOrPlugin("@scope", true), "@scope/babel-preset");
	t.is(normalizePresetOrPlugin("@scope", false), "@scope/babel-plugin");
	t.is(normalizePresetOrPlugin("@scope/babel-preset", true), "@scope/babel-preset");
	t.is(normalizePresetOrPlugin("@scope/babel-plugin", false), "@scope/babel-plugin");
	t.is(normalizePresetOrPlugin("@scope/mod", true), "@scope/babel-preset-mod");
	t.is(normalizePresetOrPlugin("@scope/mod", false), "@scope/babel-plugin-mod");
	t.is(normalizePresetOrPlugin("@scope/babel-preset-mod", true), "@scope/babel-preset-mod");
	t.is(normalizePresetOrPlugin("@scope/babel-plugin-mod", false), "@scope/babel-plugin-mod");
	t.is(normalizePresetOrPlugin("@scope/prefix-babel-preset-mod", true), "@scope/prefix-babel-preset-mod");
	t.is(normalizePresetOrPlugin("@scope/prefix-babel-plugin-mod", false), "@scope/prefix-babel-plugin-mod");
	t.is(normalizePresetOrPlugin("@scope/mod/preset", true), "@scope/mod/preset");
	t.is(normalizePresetOrPlugin("@scope/mod/plugin", false), "@scope/mod/plugin");
	t.is(normalizePresetOrPlugin("module:foo", true), "foo");
	t.is(normalizePresetOrPlugin("module:foo", false), "foo");
});

test("simple creation of babel config", async (t) => {
	const config = await t.context.util.createBabelConfig({
		configuration: {
			debug: true,
			skipBabelPresetPluginResolve: true
		}
	});
	t.true(config !== undefined);
});

test("usage of external babel config", async (t) => {
	const cwd = path.join(__dirname, "__assets__/external");
	const config = await t.context.util.createBabelConfig(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	t.true(config !== undefined);
	t.deepEqual(config.presets[0].file.request, "transform-ui5");
	t.deepEqual(config.presets[1].file.request, "@babel/preset-typescript");
	t.deepEqual(config.presets[2].file.request, "@babel/preset-env");
});

test("usage of external js babel config", async (t) => {
	const cwd = path.join(__dirname, "__assets__/external-js");
	const config = await t.context.util.createBabelConfig(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	t.true(config !== undefined);
	t.deepEqual(config.presets[0].file.request, "transform-ui5");
	t.deepEqual(config.presets[1].file.request, "@babel/preset-typescript");
	t.deepEqual(config.presets[2].file.request, "@babel/preset-env");
	t.deepEqual(config.plugins[0].file.request, "transform-async-to-promises");
});

test("inject configuration options", async (t) => {
	const cwd = path.join(__dirname, "__assets__/typescript");

	// typescript, default config
	let configuration = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	let babelConfig = await t.context.util.createBabelConfig({ configuration }, cwd);
	t.deepEqual(
		babelConfig,
		await t.context.util._helpers.loadBabelConfigOptions(
			{
				plugins: [],
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								browsers: "defaults"
							},
							modules: false
						}
					],
					"transform-ui5",
					"@babel/preset-typescript"
				],
				sourceMaps: true
			},
			true,
			cwd
		)
	);

	// typescript, custom transform-ui5 config
	configuration = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				transformModulesToUI5: {
					overridesToOverride: true
				},
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	babelConfig = await t.context.util.createBabelConfig({ configuration }, cwd);
	t.deepEqual(
		babelConfig,
		await t.context.util._helpers.loadBabelConfigOptions(
			{
				plugins: [],
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								browsers: "defaults"
							},
							modules: false
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
			},
			true,
			cwd
		)
	);

	// typescript, custom typescript and transform-ui5 config
	configuration = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				transformTypeScript: {
					optimizeConstEnums: true
				},
				transformModulesToUI5: {
					overridesToOverride: true
				},
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	babelConfig = await t.context.util.createBabelConfig({ configuration }, cwd);
	t.deepEqual(
		babelConfig,
		await t.context.util._helpers.loadBabelConfigOptions(
			{
				plugins: [],
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								browsers: "defaults"
							},
							modules: false
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
			},
			true,
			cwd
		)
	);
});

test("usage of external babel config file", async (t) => {
	const babelConfig = path.join(__dirname, "__assets__/external/.babelrc");
	const config = await t.context.util.createBabelConfig({
		configuration: {
			debug: true,
			babelConfig
		}
	});
	t.true(config !== undefined);
	t.deepEqual(config.presets[0].file.request, "transform-ui5");
	t.deepEqual(config.presets[1].file.request, "@babel/preset-typescript");
	t.deepEqual(config.presets[2].file.request, "@babel/preset-env");
});

test("generate babel config file", async (t) => {
	const tmpDir = path.resolve(__dirname, `__dist__/${crypto.randomBytes(5).toString("hex")}`);
	const config = await t.context.util.createBabelConfig(
		{
			configuration: {
				debug: true,
				generateBabelConfig: true
			}
		},
		tmpDir
	);
	t.true(config !== undefined);
	t.true(fs.existsSync(path.join(tmpDir, "babel.config.json")));
	t.deepEqual(config.presets[0].file.request, "@babel/preset-env");
	fs.rmSync(tmpDir, { recursive: true });
});

test("generate babel config file with a name", async (t) => {
	const tmpDir = path.resolve(__dirname, `__dist__/${crypto.randomBytes(5).toString("hex")}`);
	const config = await t.context.util.createBabelConfig(
		{
			configuration: {
				debug: true,
				generateBabelConfig: ".babelrc",
				transformModulesToUI5: true,
				transformTypeScript: true
			}
		},
		tmpDir
	);
	t.true(config !== undefined);
	t.true(fs.existsSync(path.join(tmpDir, ".babelrc")));
	t.deepEqual(config.presets[0].file.request, "@babel/preset-env");
	t.deepEqual(config.presets[1].file.request, "transform-ui5");
	t.deepEqual(config.presets[2].file.request, "@babel/preset-typescript");
	fs.rmSync(tmpDir, { recursive: true });
});
