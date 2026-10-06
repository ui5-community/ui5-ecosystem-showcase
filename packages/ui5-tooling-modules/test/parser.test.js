const { default: test } = require("ava");
const path = require("path");

/**
 * Tests for the oxc-parser integration used by util.js (scan/findUniqueJSDeps)
 * and task.js (rewriteJSDeps).
 *
 * oxc-parser infers the source dialect from the filename extension, but `.js`
 * files need an explicit `lang: "jsx"` override because some UI5 projects
 * embed JSX in plain `.js` sources. These tests verify that every supported
 * file type is parsed correctly and that UI5 dependency patterns are discovered.
 */

// Mirrors the parse logic from lib/util.js (findUniqueJSDeps)
async function findDeps(content, filePath) {
	const { parseSync } = await import("oxc-parser");
	const { walk } = await import("estree-walker");

	const ext = path.extname(filePath);
	const parseOpts = ext === ".js" || ext === ".mjs" || ext === ".cjs" ? { lang: "jsx" } : {};
	const { program, errors } = parseSync(filePath, content, parseOpts);
	if (errors.length > 0) {
		return { deps: [], error: errors[0].message };
	}
	const deps = [];
	walk(program, {
		enter(node) {
			if (node?.type === "ImportDeclaration") {
				deps.push(node.source.value);
			} else if (node?.type === "ImportExpression") {
				deps.push(node.source?.value);
			} else if (
				node?.type === "CallExpression" &&
				/require|define/.test(node?.callee?.property?.name) &&
				node?.callee?.object?.property?.name === "ui" &&
				node?.callee?.object?.object?.name === "sap"
			) {
				const depsArray = node.arguments.filter((arg) => arg.type === "ArrayExpression");
				depsArray?.[0]?.elements?.filter((el) => el.type === "Literal").forEach((el) => deps.push(el.value));
			}
		},
	});
	return { deps };
}

// ---- .js files ----

test("parse .js – ES import", async (t) => {
	const { deps } = await findDeps('import Button from "sap/m/Button";', "/app/Component.js");
	t.deepEqual(deps, ["sap/m/Button"]);
});

test("parse .js – sap.ui.define", async (t) => {
	const { deps } = await findDeps('sap.ui.define(["sap/m/Button"], function(Button) {});', "/app/Component.js");
	t.deepEqual(deps, ["sap/m/Button"]);
});

test("parse .js – JSX content is accepted", async (t) => {
	const { deps } = await findDeps('import React from "react";\nconst el = <div>hello</div>;', "/app/Component.js");
	t.deepEqual(deps, ["react"]);
});

test("parse .js – dynamic import", async (t) => {
	const { deps } = await findDeps('const m = import("sap/m/Dialog");', "/app/Component.js");
	t.deepEqual(deps, ["sap/m/Dialog"]);
});

// ---- .jsx files ----

test("parse .jsx – JSX with imports", async (t) => {
	const { deps } = await findDeps('import React from "react";\nconst el = <div>hello</div>;', "/app/Component.jsx");
	t.deepEqual(deps, ["react"]);
});

// ---- .ts files ----

test("parse .ts – typed import", async (t) => {
	const { deps } = await findDeps('import Button from "sap/m/Button";\nconst x: string = "hi";', "/app/Component.ts");
	t.deepEqual(deps, ["sap/m/Button"]);
});

test("parse .ts – sap.ui.define with type annotations", async (t) => {
	const { deps } = await findDeps('sap.ui.define(["sap/m/Button"], function(Button: any) {});', "/app/Component.ts");
	t.deepEqual(deps, ["sap/m/Button"]);
});

// ---- .tsx files ----

test("parse .tsx – TypeScript types and JSX combined", async (t) => {
	const { deps } = await findDeps('import React from "react";\nconst el: JSX.Element = <div>hello</div>;', "/app/Component.tsx");
	t.deepEqual(deps, ["react"]);
});

test("parse .tsx – sap.ui.define with types and JSX", async (t) => {
	const { deps } = await findDeps('sap.ui.define(["sap/m/Button"], function(Button: any) { return <Button/>; });', "/app/Component.tsx");
	t.deepEqual(deps, ["sap/m/Button"]);
});

// ---- .mjs / .cjs files ----

test("parse .mjs – ES import", async (t) => {
	const { deps } = await findDeps('import helper from "my-helper";', "/lib/utils.mjs");
	t.deepEqual(deps, ["my-helper"]);
});

test("parse .mjs – JSX content is accepted", async (t) => {
	const { deps } = await findDeps('import React from "react";\nconst el = <div/>;', "/lib/utils.mjs");
	t.deepEqual(deps, ["react"]);
});

// ---- error handling ----

test("parse – syntax error yields error, no crash", async (t) => {
	const { deps, error } = await findDeps("const = ;", "/app/broken.js");
	t.deepEqual(deps, []);
	t.truthy(error);
});

test("parse – empty content yields no deps", async (t) => {
	const { deps, error } = await findDeps("", "/app/empty.js");
	t.deepEqual(deps, []);
	t.is(error, undefined);
});
