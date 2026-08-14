const { default: test } = require("ava");

const task = require("../lib/task");

// determineRequiredDependencies controls the build order: when cascadedBuild is
// enabled, the task must require its dependencies to be built first so that their
// externals manifests are available to be read during this library's build.

test("determineRequiredDependencies returns no dependencies by default", async (t) => {
	const availableDependencies = new Set(["dep.a", "dep.b"]);
	const result = await task.determineRequiredDependencies({ availableDependencies, options: {} });
	t.true(result instanceof Set);
	t.is(result.size, 0);
});

test("determineRequiredDependencies returns no dependencies when cascadedBuild is disabled", async (t) => {
	const availableDependencies = new Set(["dep.a", "dep.b"]);
	const result = await task.determineRequiredDependencies({ availableDependencies, options: { configuration: { cascadedBuild: false } } });
	t.is(result.size, 0);
});

test("determineRequiredDependencies requires all dependencies when cascadedBuild is enabled", async (t) => {
	const availableDependencies = new Set(["dep.a", "dep.b"]);
	const result = await task.determineRequiredDependencies({ availableDependencies, options: { configuration: { cascadedBuild: true } } });
	t.is(result, availableDependencies);
	t.deepEqual([...result], ["dep.a", "dep.b"]);
});

test("determineRequiredDependencies tolerates being called without arguments", async (t) => {
	const result = await task.determineRequiredDependencies();
	t.true(result instanceof Set);
	t.is(result.size, 0);
});
