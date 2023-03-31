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
