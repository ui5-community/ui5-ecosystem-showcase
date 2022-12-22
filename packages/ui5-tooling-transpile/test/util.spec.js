const util = require("../lib/util");
const { EOL } = require("os");

describe("util", () => {
	describe("createBabelConfig", () => {
		const defaultConfig = {
			plugins: [],
			presets: [["@babel/preset-env", { targets: { browsers: "last 2 versions, ie 10-11" } }]],
			sourceMaps: true
		};

		test("nothing provided, get default config", async () => {
			const config = await util.createBabelConfig({ configuration: {} });
			expect(config).toEqual(defaultConfig);
		});

		test("nothing provided, get default config, when running as middleware", async () => {
			const config = await util.createBabelConfig({ configuration: {}, isMiddleware: true });
			expect(config.sourceMaps).toBe("inline");
		});

		test.skip("nothing provided, get default config with optional parameters", () => {
			// TBD
		});

		test.skip("babel config provided in yaml", () => {
			// TBD
		});

		test.skip("babel config from babelrc", () => {
			// TBD
		});
	});

	describe("normalizeLineFeeds", () => {
		const expected = `a${EOL}b${EOL}c${EOL}`;

		test("different EOLs normalized", () => {
			expect(util.normalizeLineFeeds("a\nb\r\nc\r")).toBe(expected);
		});

		test("nothing changed if correct EOL used", () => {
			expect(util.normalizeLineFeeds(expected)).toBe(expected);
		});
	});
});
