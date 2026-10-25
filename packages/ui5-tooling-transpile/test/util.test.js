const { default: test } = require("ava");
const path = require("path");
const fs = require("fs");
const { randomBytes } = require("node:crypto");

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

test("inject sourceFolders into transform-ui5 preset", async (t) => {
	const cwd = path.join(__dirname, "__assets__/typescript");

	// auto-derived sourceFolders are injected as-is
	const configuration = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	const babelConfig = await t.context.util.createBabelConfig(
		{ configuration, sourceFolders: { src: "my.lib", test: "my.lib.test" } },
		cwd
	);
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
							sourceFolders: { src: "my.lib", test: "my.lib.test" }
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

	// explicit transformModulesToUI5.sourceFolders in ui5.yaml overrides the auto-derived value
	const configurationWithOverride = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				transformModulesToUI5: {
					sourceFolders: { webapp: "my.override" }
				},
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	const babelConfigOverride = await t.context.util.createBabelConfig(
		{ configuration: configurationWithOverride, sourceFolders: { src: "my.lib", test: "my.lib.test" } },
		cwd
	);
	t.deepEqual(
		babelConfigOverride,
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
							sourceFolders: { webapp: "my.override" }
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

	// sourceFolders merged with other explicit transformModulesToUI5 options
	const configurationWithExtra = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				transformModulesToUI5: {
					autoConvertAllExtendClassesByDefault: true
				},
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	const babelConfigExtra = await t.context.util.createBabelConfig(
		{ configuration: configurationWithExtra, sourceFolders: { webapp: "my.app" } },
		cwd
	);
	t.deepEqual(
		babelConfigExtra,
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
							sourceFolders: { webapp: "my.app" },
							autoConvertAllExtendClassesByDefault: true
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
	// dependencies forwarded as-is into the transform-ui5 preset options
	const configurationWithDeps = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	const depsList = [{ sourceRoot: "/some/lib", sourceFolders: { src: "my.lib" } }];
	const babelConfigDeps = await t.context.util.createBabelConfig(
		{ configuration: configurationWithDeps, dependencies: depsList },
		cwd
	);
	t.deepEqual(
		babelConfigDeps,
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
							dependencies: depsList
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
});

test("deriveSourceFolders from project type", (t) => {
	const { deriveSourceFolders } = t.context.util;
	const cwd = "/project";

	// application: maps webapp folder → namespace
	t.deepEqual(
		deriveSourceFolders(
			{
				getType: () => "application",
				getNamespace: () => "my/app",
				getSourcePath: () => "/project/webapp",
				getCustomConfiguration: () => undefined
			},
			cwd
		),
		{ webapp: "my.app" }
	);

	// application with custom webapp path
	t.deepEqual(
		deriveSourceFolders(
			{
				getType: () => "application",
				getNamespace: () => "my/app",
				getSourcePath: () => "/project/src/main",
				getCustomConfiguration: () => undefined
			},
			cwd
		),
		{ "src/main": "my.app" }
	);

	// library: maps src → namespace, test → namespace.test (default test folder name)
	t.deepEqual(
		deriveSourceFolders(
			{
				getType: () => "library",
				getNamespace: () => "my/lib",
				getSourcePath: () => "/project/src",
				getCustomConfiguration: () => undefined
			},
			cwd
		),
		{ src: "my.lib", test: "my.lib.test" }
	);

	// library with custom src and test folder names from ui5.yaml
	t.deepEqual(
		deriveSourceFolders(
			{
				getType: () => "library",
				getNamespace: () => "my/lib",
				getSourcePath: () => "/project/sources",
				getCustomConfiguration: () => ({
					resources: { configuration: { paths: { test: "tests" } } }
				})
			},
			cwd
		),
		{ sources: "my.lib", tests: "my.lib.test" }
	);

	// unknown project type → undefined
	t.is(
		deriveSourceFolders(
			{
				getType: () => "theme-library",
				getNamespace: () => "my/theme",
				getSourcePath: () => "/project/src",
				getCustomConfiguration: () => undefined
			},
			cwd
		),
		undefined
	);

	// no namespace → undefined
	t.is(
		deriveSourceFolders(
			{
				getType: () => "library",
				getNamespace: () => undefined,
				getSourcePath: () => "/project/src",
				getCustomConfiguration: () => undefined
			},
			cwd
		),
		undefined
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
	const tmpDir = path.resolve(__dirname, `__dist__/${randomBytes(5).toString("hex")}`);
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
	const tmpDir = path.resolve(__dirname, `__dist__/${randomBytes(5).toString("hex")}`);
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

test("shouldHandlePath: classic substring matching (default)", (t) => {
	const { shouldHandlePath } = t.context.util;
	// excluded by substring
	t.false(shouldHandlePath("/my/app/thirdparty/foo.js", ["/thirdparty/"], []));
	// not excluded
	t.true(shouldHandlePath("/my/app/foo.js", ["/thirdparty/"], []));
	// includes override an exclude (existing OR semantics)
	t.true(shouldHandlePath("/my/app/thirdparty/keep.js", ["/thirdparty/"], ["keep"]));
	// glob-style pattern is treated literally as a substring (does NOT match) -> path is handled
	t.true(shouldHandlePath("/my/app/thirdparty/foo.js", ["**/thirdparty/**"], []));
});

test("shouldHandlePath: glob matching when useGlobPatterns is enabled", (t) => {
	const { shouldHandlePath } = t.context.util;
	// a substring pattern no longer matches as a glob -> path is handled
	t.true(shouldHandlePath("/my/app/thirdparty/foo.js", ["/thirdparty/"], [], true));
	// a proper glob excludes the path
	t.false(shouldHandlePath("/my/app/thirdparty/foo.js", ["**/thirdparty/**"], [], true));
	// includes glob overrides an exclude glob (existing OR semantics)
	t.true(shouldHandlePath("/my/app/thirdparty/keep.js", ["**/thirdparty/**"], ["**/keep.js"], true));
	// non-matching exclude glob -> path is handled
	t.true(shouldHandlePath("/my/app/foo.js", ["**/thirdparty/**"], [], true));
});

test("createConfiguration: useGlobPatterns default false, globbed default excludes when enabled", async (t) => {
	const { createConfiguration } = t.context.util;
	// default: substring-style default excludes, flag false
	const classic = await createConfiguration({ configuration: {} });
	t.false(classic.useGlobPatterns);
	t.deepEqual(classic.excludes, [".png", ".jpeg", ".jpg"]);
	// with the flag: default excludes are expressed as globs
	const glob = await createConfiguration({ configuration: { useGlobPatterns: true } });
	t.true(glob.useGlobPatterns);
	t.deepEqual(glob.excludes, ["**/*.png", "**/*.jpeg", "**/*.jpg"]);
});

test("deriveModulesMap: maps aliases from pathAliases via sourceFolders", (t) => {
	const { deriveModulesMap } = t.context.util._helpers;

	// @/* with target "webapp/*" → webapp root → my/app/
	const fn = deriveModulesMap({ pathAliases: { "@/*": ["webapp/*"] } }, { webapp: "my.app" });
	t.is(typeof fn, "function");
	t.is(fn("@/utils/formatter"), "my/app/utils/formatter");
	t.is(fn("sap/ui/core/Control"), "sap/ui/core/Control"); // no alias → passthrough

	// @utils/* with target "webapp/utils/*" → webapp/utils → my/app/utils/
	const fn2 = deriveModulesMap({ pathAliases: { "@utils/*": ["webapp/utils/*"] } }, { webapp: "my.app" });
	t.is(typeof fn2, "function");
	t.is(fn2("@utils/formatter"), "my/app/utils/formatter");
	t.is(fn2("@other/x"), "@other/x"); // no matching alias → passthrough
});

test("deriveModulesMap: only pathAliases from ui5.yaml are used — tsconfig paths are ignored", (t) => {
	const { deriveModulesMap } = t.context.util._helpers;

	// only pathAliases is processed; tsConfigPaths is no longer read
	const fn = deriveModulesMap({ pathAliases: { "@/*": ["webapp/utils/*"] } }, { webapp: "my.app" });
	t.is(typeof fn, "function");
	t.is(fn("@/x"), "my/app/utils/x");
});

test("deriveModulesMap: returns undefined when no aliases present", (t) => {
	const { deriveModulesMap } = t.context.util._helpers;
	t.is(deriveModulesMap({}, { webapp: "my.app" }), undefined);
	t.is(deriveModulesMap({ pathAliases: {} }, { webapp: "my.app" }), undefined);
});

test("deriveModulesMap: non-wildcard entries are skipped", (t) => {
	const { deriveModulesMap } = t.context.util._helpers;
	// exact-match key — no wildcard suffix
	const fn = deriveModulesMap({ pathAliases: { "@utils": ["webapp/utils"] } }, { webapp: "my.app" });
	t.is(fn, undefined);
});

test("pathAliases: modulesMap is injected into transform-ui5 preset when pathAliases are set", async (t) => {
	const cwd = path.join(__dirname, "__assets__/typescript");
	const configuration = t.context.util.createConfiguration(
		{
			configuration: {
				debug: true,
				skipBabelPresetPluginResolve: true,
				pathAliases: { "@/*": ["webapp/*"] }
			}
		},
		cwd
	);
	const babelConfig = await t.context.util.createBabelConfig(
		{ configuration, sourceFolders: { webapp: "my.app" } },
		cwd
	);
	const ui5Preset = babelConfig.presets.find((p) => p?.file?.request === "transform-ui5");
	t.truthy(ui5Preset, "transform-ui5 preset should be present");
	const modulesMap = ui5Preset?.options?.modulesMap;
	t.is(typeof modulesMap, "function", "modulesMap should be a function");
	t.is(modulesMap("@/utils"), "my/app/utils");
	t.is(modulesMap("sap/ui/core/Control"), "sap/ui/core/Control");
});

test("pathAliases: no modulesMap when no pathAliases configured", async (t) => {
	const cwd = path.join(__dirname, "__assets__/typescript");
	const configuration = t.context.util.createConfiguration(
		{ configuration: { skipBabelPresetPluginResolve: true } },
		cwd
	);
	const babelConfig = await t.context.util.createBabelConfig(
		{ configuration, sourceFolders: { webapp: "my.app" } },
		cwd
	);
	const ui5Preset = babelConfig.presets.find((p) => p?.file?.request === "transform-ui5");
	t.is(ui5Preset?.options?.modulesMap, undefined, "modulesMap should not be set when no pathAliases");
});

test("pathAliases: explicit modulesMap in ui5.yaml is not overridden", async (t) => {
	const cwd = path.join(__dirname, "__assets__/typescript");
	const userModulesMap = (src) => src;
	const configuration = t.context.util.createConfiguration(
		{
			configuration: {
				transformModulesToUI5: { modulesMap: userModulesMap },
				skipBabelPresetPluginResolve: true
			}
		},
		cwd
	);
	const babelConfig = await t.context.util.createBabelConfig(
		{ configuration, sourceFolders: { webapp: "my.app" } },
		cwd
	);
	const ui5Preset = babelConfig.presets.find((p) => p?.file?.request === "transform-ui5");
	t.is(ui5Preset?.options?.modulesMap, userModulesMap, "user-supplied modulesMap must not be replaced");
});
