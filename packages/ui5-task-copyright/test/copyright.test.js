const path = require("path");
const { mkdirSync, rmSync, readFileSync } = require("fs");
const { spawnSync } = require("child_process");
const crypto = require("crypto");

const test = require("ava");

test.beforeEach(async (t) => {
	// prepare
	t.context.tmpDir = path.resolve(`./test/__dist__/${crypto.randomBytes(5).toString("hex")}`);
	mkdirSync(t.context.tmpDir);
});

test.afterEach.always(async (t) => {
	// cleanup
	rmSync(t.context.tmpDir, { recursive: true, force: true });
});

// eslint-disable-next-line jsdoc/require-jsdoc
function startsWithCopyright(file, copyrightString) {
	const content = readFileSync(file, "utf-8");
	if (file.endsWith(".js") || file.endsWith(".ts")) {
		const copyrightForJS = copyrightString
			.split(/\r?\n/)
			.map((line) => line.trimEnd())
			.join("\n * ");
		return content.startsWith(`/*!\n * ${copyrightForJS}\n */\n`);
	} else if (file.endsWith(".xml")) {
		const parts = /(<\?xml.*\?>\s*)?([\s\S]*)/.exec(content);
		const xmlContent = parts[2]?.trim() || content;
		const copyrightForXML = copyrightString
			.split(/\r?\n/)
			.map((line) => line.trimEnd())
			.join("\n  ");
		return xmlContent.startsWith(`<!--\n  ${copyrightForXML}\n-->\n`);
	}
	return false;
}

test("Inline copyright", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.inline.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
	});

	// check files to include copyright
	const copyright = `Copyright ${new Date().getFullYear()} UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "data/data.xml"), copyright));
});

test("Inline copyright + current year", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.inline-altyear.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
	});

	// check files to include copyright
	const copyright = `Copyright 2021 UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Inline copyright + current year (env)", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.inline.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
		env: Object.assign({}, process.env, {
			ui5_task_copyright__current_year: "2021",
		}),
	});

	// check files to include copyright
	const copyright = `Copyright 2021 UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Copyright from file", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.file.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
	});

	// check files to include copyright
	const copyright = `Copyright ${new Date().getFullYear()} UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Copyright from file (alt)", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.file-alt.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
	});

	// check files to include copyright
	const copyright = `Copyright ${new Date().getFullYear()} UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Copyright from file (env)", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.file-env.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
		env: Object.assign({}, process.env, {
			ui5_task_copyright__file: "./copyright-alt.txt",
			ui5_task_copyright__placeholder_current_year: "altCurrentYear",
		}),
	});

	// check files to include copyright
	const copyright = `Copyright ${new Date().getFullYear()} UI5 Community\nAll rights reserved.`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("No copyright", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.no.copyright.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
	});

	// check files to include copyright
	const copyright = `\${copyright}`;
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.false(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.false(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.false(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.false(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.false(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Copyright from env", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.file-env.yaml") };
	const copyright = `Copyright ${new Date().getFullYear()} UI5 Community\nAll rights reserved.`;
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
		env: Object.assign({}, process.env, {
			ui5_task_copyright__copyright: copyright,
		}),
	});

	// check files to include copyright
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});

test("Copyright from env + custom current year", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.file-env.yaml") };
	const currentYear = "2021";
	const copyright = `Copyright ${currentYear} UI5 Community\nAll rights reserved.`;
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-tsapp"),
		env: Object.assign({}, process.env, {
			ui5_task_copyright__copyright: copyright,
			ui5_task_copyright__current_year: currentYear,
		}),
	});

	// check files to include copyright
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "Component-dbg.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/App-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "controller/Main-dbg.controller.js"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/App.view.xml"), copyright));
	t.true(startsWithCopyright(path.resolve(t.context.tmpDir, "dist", "view/Main.view.xml"), copyright));
});
