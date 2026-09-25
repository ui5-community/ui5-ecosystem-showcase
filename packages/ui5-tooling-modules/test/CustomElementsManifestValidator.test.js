const { default: test } = require("ava");

const { validateManifest, formatReport, ISSUE_CODES } = require("../lib/utils/CustomElementsManifestValidator");

// eslint-disable-next-line jsdoc/require-jsdoc
function tuples(result) {
	return result.issues.map(({ code, severity, entity }) => ({ code, severity, entity }));
}

// eslint-disable-next-line jsdoc/require-jsdoc
function findIssue(result, code) {
	return result.issues.find((i) => i.code === code);
}

// eslint-disable-next-line jsdoc/require-jsdoc
function validClass(overrides = {}) {
	return {
		kind: "class",
		name: "MyComp",
		customElement: true,
		tagName: "my-comp",
		superclass: { name: "UI5Element", package: "@ui5/webcomponents-base", module: "dist/UI5Element.js" },
		members: [],
		slots: [],
		events: [],
		...overrides,
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
function validModule(overrides = {}) {
	return {
		kind: "javascript-module",
		path: "dist/MyComp.js",
		declarations: [validClass()],
		exports: [{ kind: "custom-element-definition", declaration: { name: "MyComp", module: "dist/MyComp.js" } }],
		...overrides,
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
function validManifest(overrides = {}) {
	return { schemaVersion: "1.0.0", modules: [validModule()], ...overrides };
}

// --- ISSUE_CODES sanity ----------------------------------------------------

test("ISSUE_CODES is frozen and covers every documented WCV code", (t) => {
	t.true(Object.isFrozen(ISSUE_CODES));
	const codes = Object.keys(ISSUE_CODES);
	// sanity: at least all codes we explicitly listed in the plan
	const expected = [
		"WCV000",
		"WCV001",
		"WCV002",
		"WCV010",
		"WCV011",
		"WCV012",
		"WCV013",
		"WCV014",
		"WCV020",
		"WCV021",
		"WCV022",
		"WCV023",
		"WCV030",
		"WCV031",
		"WCV032",
		"WCV033",
		"WCV040",
		"WCV041",
		"WCV042",
		"WCV043",
		"WCV050",
		"WCV051",
		"WCV052",
		"WCV060",
		"WCV061",
		"WCV062",
		"WCV070",
		"WCV080",
		"WCV081",
		"WCV082",
		"WCV090",
	];
	for (const code of expected) {
		t.true(codes.includes(code), `missing ${code}`);
	}
});

// --- Happy path -----------------------------------------------------------

test("happy path manifest produces zero issues", (t) => {
	const result = validateManifest(validManifest(), { namespace: "my-pkg" });
	t.is(result.summary.total, 0);
	t.is(result.summary.error, 0);
	t.is(result.summary.warn, 0);
	t.is(result.summary.info, 0);
	t.is(result.namespace, "my-pkg");
});

// --- Root checks ----------------------------------------------------------

test("WCV000 — manifest is not an object", (t) => {
	for (const bad of [null, undefined, 42, "string", []]) {
		const result = validateManifest(bad, { namespace: "p" });
		t.true(tuples(result).some((i) => i.code === "WCV000"));
	}
});

test("WCV001 — modules is not an array", (t) => {
	const result = validateManifest({ schemaVersion: "1.0", modules: "nope" }, { namespace: "p" });
	t.true(tuples(result).some((i) => i.code === "WCV001"));
});

test("WCV002 — modules is empty", (t) => {
	const result = validateManifest({ schemaVersion: "1.0", modules: [] }, { namespace: "p" });
	const issue = findIssue(result, "WCV002");
	t.truthy(issue);
	t.is(issue.severity, "info");
});

// --- Module checks --------------------------------------------------------

test("WCV010 — module.kind is not 'javascript-module'", (t) => {
	const result = validateManifest(validManifest({ modules: [validModule({ kind: "css-module" })] }), { namespace: "p" });
	t.true(tuples(result).some((i) => i.code === "WCV010"));
});

test("WCV011 — module.path is missing", (t) => {
	const result = validateManifest(validManifest({ modules: [validModule({ path: undefined })] }), { namespace: "p" });
	t.true(tuples(result).some((i) => i.code === "WCV011"));
});

test("WCV012 — module.path has leading slash", (t) => {
	const result = validateManifest(validManifest({ modules: [validModule({ path: "/dist/MyComp.js" })] }), { namespace: "p" });
	const issue = findIssue(result, "WCV012");
	t.truthy(issue);
	t.is(issue.severity, "info");
});

test("WCV013 — module.declarations is not an array", (t) => {
	const result = validateManifest(validManifest({ modules: [validModule({ declarations: "x" })] }), { namespace: "p" });
	t.true(tuples(result).some((i) => i.code === "WCV013"));
});

test("WCV014 — module.exports is not an array", (t) => {
	const result = validateManifest(validManifest({ modules: [validModule({ exports: "x" })] }), { namespace: "p" });
	t.true(tuples(result).some((i) => i.code === "WCV014"));
});

// --- Declaration checks ---------------------------------------------------

test("WCV020 — unknown declaration kind", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "mixin", name: "M" }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV020");
	t.truthy(issue);
	t.is(issue.severity, "error");
});

test("WCV021 — declaration.name is missing", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "class" /* no name */ }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV021");
	t.truthy(issue);
});

test("WCV022 — custom-element-definition export references unknown class", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [validClass({ name: "MyComp" })],
					exports: [{ kind: "custom-element-definition", declaration: { name: "Ghost" } }],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV022");
	t.truthy(issue);
	t.is(issue.entity, "Ghost");
});

test("WCV023 — class declared but not exported", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [validClass({ name: "Orphan" })],
					exports: [], // no export for Orphan
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV023");
	t.truthy(issue);
	t.is(issue.entity, "Orphan");
});

// --- Class checks ---------------------------------------------------------

test("WCV030 — customElement without tagName", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ tagName: undefined })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV030"));
});

test("WCV031 — superclass is a dotted string", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ superclass: "@scope/pkg.Base" })] })],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV031");
	t.truthy(issue);
	t.is(issue.extra, "@scope/pkg.Base");
});

test("WCV031 — superclass object with dotted name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ superclass: { name: "@ui5/webcomponents.UI5Element" } })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV031"));
});

test("WCV032 — superclass.name is missing", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ superclass: { package: "x" } })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV032"));
});

test("WCV033 — class.members is not an array", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ members: { not: "array" } })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV033"));
});

// --- Member checks --------------------------------------------------------

test("WCV040 — member.kind is invalid", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ members: [{ kind: "property", name: "foo" }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV040"));
});

test("WCV041 — member.name is missing", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ members: [{ kind: "field" /* no name */ }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV041"));
});

test("WCV042 — field has unclear type", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ members: [{ kind: "field", name: "foo" /* no type.text */ }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV042"));
});

test("WCV043 — type reference missing name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [
						validClass({
							members: [
								{
									kind: "field",
									name: "foo",
									type: { text: "Foo", references: [{ package: "x" }] },
								},
							],
						}),
					],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV043");
	t.truthy(issue);
	t.is(issue.severity, "info");
});

// --- Slot checks ----------------------------------------------------------

test("WCV050 — slot.name is missing", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ slots: [{}] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV050"));
});

test("WCV051 — slot _ui5type with no .text", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ slots: [{ name: "default", _ui5type: {} }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV051"));
});

test("WCV052 — valueStateMessage slot without valueState property", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [
						validClass({
							members: [],
							slots: [{ name: "valueStateMessage" }],
						}),
					],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV052");
	t.truthy(issue);
	t.is(issue.severity, "info");
});

test("WCV052 — does not fire when valueState field is present", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [
						validClass({
							members: [{ kind: "field", name: "valueState", type: { text: "string" } }],
							slots: [{ name: "valueStateMessage" }],
						}),
					],
				}),
			],
		}),
		{ namespace: "p" },
	);
	t.false(tuples(result).some((i) => i.code === "WCV052"));
});

// --- Event checks ---------------------------------------------------------

test("WCV060 — event.name is missing", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ events: [{}] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV060"));
});

test("WCV061 — event _ui5parameters is not an array", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ events: [{ name: "change", _ui5parameters: "nope" }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV061"));
});

test("WCV062 — event parameter has no name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [validModule({ declarations: [validClass({ events: [{ name: "change", _ui5parameters: [{}] }] })] })],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV062"));
});

// --- Interface check ------------------------------------------------------

test("WCV070 — interface without name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "interface" /* no name */ }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV070"));
});

// --- Enum checks ----------------------------------------------------------

test("WCV080 — enum without name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "enum" /* no name */, members: [{ name: "A" }] }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV080"));
});

test("WCV081 — enum.members is not an array", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "enum", name: "MyEnum", members: "nope" }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV081"));
});

test("WCV082 — enum member has no name", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [{ kind: "enum", name: "MyEnum", members: [{}] }],
					exports: [],
				}),
			],
		}),
		{ namespace: "p" },
	);
	t.true(tuples(result).some((i) => i.code === "WCV082"));
});

// --- Cross-reference (same package) --------------------------------------

test("WCV090 — _ui5implements references undeclared same-package interface", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [validClass({ _ui5implements: [{ name: "IGhost" /* no package or package === ours */ }] })],
				}),
			],
		}),
		{ namespace: "p" },
	);
	const issue = findIssue(result, "WCV090");
	t.truthy(issue);
});

test("WCV090 — does not fire for cross-package interface references", (t) => {
	const result = validateManifest(
		validManifest({
			modules: [
				validModule({
					declarations: [validClass({ _ui5implements: [{ name: "IOther", package: "@other/pkg" }] })],
				}),
			],
		}),
		{ namespace: "@my/pkg" },
	);
	t.false(tuples(result).some((i) => i.code === "WCV090"));
});

test("WCV090 — does not fire when the interface is declared in the same package", (t) => {
	const result = validateManifest(
		{
			modules: [
				{
					kind: "javascript-module",
					path: "dist/IButton.js",
					declarations: [{ kind: "interface", name: "IButton" }],
					exports: [],
				},
				validModule({
					declarations: [validClass({ _ui5implements: [{ name: "IButton" }] })],
				}),
			],
		},
		{ namespace: "@my/pkg" },
	);
	t.false(tuples(result).some((i) => i.code === "WCV090"));
});

// --- formatReport smoke test ---------------------------------------------

test("formatReport: zero issues prints a single OK line", (t) => {
	const lines = { info: [], warn: [], error: [] };
	const log = {
		info: (m) => lines.info.push(m),
		warn: (m) => lines.warn.push(m),
		error: (m) => lines.error.push(m),
	};
	formatReport([], { error: 0, warn: 0, info: 0, total: 0 }, { namespace: "my-pkg" }, log);
	t.is(lines.info.length, 1);
	t.regex(lines.info[0], /Validation OK for my-pkg/);
	t.is(lines.warn.length, 0);
	t.is(lines.error.length, 0);
});

test("formatReport: routes issues to channels by severity", (t) => {
	const lines = { info: [], warn: [], error: [] };
	const log = {
		info: (m) => lines.info.push(m),
		warn: (m) => lines.warn.push(m),
		error: (m) => lines.error.push(m),
	};
	const issues = [
		{ severity: "error", code: "WCV020", message: "x", entity: "A.kind", path: "modules[0]" },
		{ severity: "warn", code: "WCV031", message: "y", entity: "B", path: "modules[0]" },
		{ severity: "info", code: "WCV012", message: "z", entity: "/dist/foo.js", path: "modules[0]" },
	];
	formatReport(issues, { error: 1, warn: 1, info: 1, total: 3 }, { namespace: "my-pkg" }, log);
	// header + info issue go through info; warn issue through warn; error issue through error
	t.true(lines.info.some((l) => /Validation for my-pkg/.test(l)));
	t.is(lines.error.length, 1);
	t.regex(lines.error[0], /WCV020/);
	t.is(lines.warn.length, 1);
	t.regex(lines.warn[0], /WCV031/);
	t.true(lines.info.some((l) => /WCV012/.test(l)));
});
