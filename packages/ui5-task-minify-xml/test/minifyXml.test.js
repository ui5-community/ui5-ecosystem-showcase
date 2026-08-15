const { default: test } = require("ava");

const minifyXml = require("../lib/minifyXml");

// minimal in-memory resource + workspace mocks mirroring the @ui5/fs API surface used by the task
// eslint-disable-next-line jsdoc/require-jsdoc
function createResource(pathName, content) {
	let str = content;
	return {
		getPath: () => pathName,
		getString: async () => str,
		setString: (value) => {
			str = value;
		},
		// test helper
		_get: () => str,
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
function createWorkspace(resources) {
	return {
		byGlob: async () => resources,
		write: async () => {},
	};
}

const log = { info() {}, verbose() {}, warn() {}, error() {} };

const UNMINIFIED = `<mvc:View xmlns:mvc="sap.ui.core.mvc">\n\n    <Text   text="hello" />\n\n</mvc:View>`;

test("minifies all XML resources by default", async (t) => {
	const a = createResource("/resources/app/view/App.view.xml", UNMINIFIED);
	const b = createResource("/resources/app/view/Main.view.xml", UNMINIFIED);
	await minifyXml({ log, workspace: createWorkspace([a, b]), options: { configuration: {} } });
	t.not(a._get(), UNMINIFIED, "App.view.xml should be minified");
	t.not(b._get(), UNMINIFIED, "Main.view.xml should be minified");
});

test("excludes via glob excludes patterns", async (t) => {
	const a = createResource("/resources/app/view/App.view.xml", UNMINIFIED);
	const b = createResource("/resources/app/view/Main.view.xml", UNMINIFIED);
	await minifyXml({ log, workspace: createWorkspace([a, b]), options: { configuration: { excludes: ["**/Main.view.xml"] } } });
	t.not(a._get(), UNMINIFIED, "App.view.xml should be minified");
	t.is(b._get(), UNMINIFIED, "Main.view.xml should be excluded (unchanged)");
});

test("restricts to allow-list via glob includes patterns", async (t) => {
	const a = createResource("/resources/app/view/App.view.xml", UNMINIFIED);
	const b = createResource("/resources/app/view/Main.view.xml", UNMINIFIED);
	await minifyXml({ log, workspace: createWorkspace([a, b]), options: { configuration: { includes: ["**/App.view.xml"] } } });
	t.not(a._get(), UNMINIFIED, "App.view.xml should be minified (included)");
	t.is(b._get(), UNMINIFIED, "Main.view.xml should be skipped (not in includes)");
});

test("classic excludePatterns substring behavior is preserved", async (t) => {
	const a = createResource("/resources/app/view/App.view.xml", UNMINIFIED);
	const b = createResource("/resources/app/view/Main.view.xml", UNMINIFIED);
	await minifyXml({ log, workspace: createWorkspace([a, b]), options: { configuration: { excludePatterns: ["Main.view.xml"] } } });
	t.not(a._get(), UNMINIFIED, "App.view.xml should be minified");
	t.is(b._get(), UNMINIFIED, "Main.view.xml should be excluded via substring");
});
