/**
 * Upfront validation of a Custom Elements Manifest before it is handed to the
 * WebComponentRegistry parser.
 *
 * The Custom Elements Manifest (`custom-elements.json` /
 * `custom-elements-internal.json`) is the contract between a Web Component
 * package and `ui5-tooling-modules`. The registry parser is intentionally
 * permissive — when a defect is encountered it recovers (default to `any`,
 * synthesize a superclass, etc.) and historically emitted an eager warning
 * deep inside the parsing pipeline. The result was hard to scan and easy to
 * miss.
 *
 * This module exposes a single linear pass over the manifest that:
 *   - never throws (validation is diagnostic-only);
 *   - returns a stable, typed list of issues (each with a `WCV###` code, a
 *     severity, the offending entity and a manifest path);
 *   - aggregates a per-severity summary;
 *   - leaves rendering to the caller via `formatReport(...)`.
 *
 * The validator does NOT replicate cross-package checks (e.g. unresolvable
 * superclass references) — those depend on the full registry of loaded
 * packages and stay in the registry parser. Only same-package contract
 * violations are checked here.
 *
 * @module CustomElementsManifestValidator
 */

/**
 * Stable issue catalog. Codes are part of the public surface — adding new
 * codes is fine, renaming or repurposing existing ones is not.
 */
const ISSUE_CODES = Object.freeze({
	// Root
	WCV000: { severity: "error", message: "manifest must be a non-null object" },
	WCV001: { severity: "error", message: "manifest.modules must be an array" },
	WCV002: { severity: "info", message: "manifest.modules is empty" },
	// Module
	WCV010: { severity: "warn", message: "module.kind should be 'javascript-module'" },
	WCV011: { severity: "error", message: "module.path must be a non-empty string" },
	WCV012: { severity: "info", message: "module.path has a leading slash — parser will sanitize" },
	WCV013: { severity: "warn", message: "module.declarations, if present, must be an array" },
	WCV014: { severity: "warn", message: "module.exports, if present, must be an array" },
	// Declaration
	WCV020: { severity: "error", message: "declaration.kind must be one of 'class', 'enum', 'interface'" },
	WCV021: { severity: "error", message: "declaration.name must be a non-empty string" },
	WCV022: { severity: "warn", message: "custom-element-definition export references unknown class in same module" },
	WCV023: { severity: "warn", message: "class is declared but never exported (no module path will be set)" },
	// Class
	WCV030: { severity: "warn", message: "class flagged as customElement has no tagName" },
	WCV031: { severity: "warn", message: "superclass is a dotted string — prefer {name, package, module}" },
	WCV032: { severity: "warn", message: "superclass.name must be a non-empty string" },
	WCV033: { severity: "warn", message: "class.members/slots/events, if present, must be arrays" },
	// Member
	WCV040: { severity: "error", message: "member.kind must be 'field' or 'method'" },
	WCV041: { severity: "error", message: "member.name must be a non-empty string" },
	WCV042: { severity: "warn", message: "field has unclear type (type.text missing) — defaults to 'any'" },
	WCV043: { severity: "info", message: "type reference is missing 'name'" },
	// Slot
	WCV050: { severity: "error", message: "slot.name must be a non-empty string" },
	WCV051: { severity: "warn", message: "slot has _ui5type without .text — defaults to 'any'" },
	WCV052: { severity: "info", message: "valueStateMessage slot present but no valueState property" },
	// Event
	WCV060: { severity: "error", message: "event.name must be a non-empty string" },
	WCV061: { severity: "warn", message: "event._ui5parameters, if present, must be an array" },
	WCV062: { severity: "warn", message: "event parameter has no name" },
	// Interface
	WCV070: { severity: "error", message: "interface.name must be a non-empty string" },
	// Enum
	WCV080: { severity: "error", message: "enum.name must be a non-empty string" },
	WCV081: { severity: "warn", message: "enum.members, if present, must be an array" },
	WCV082: { severity: "error", message: "enum member has no name" },
	// Cross-reference (same package only)
	WCV090: { severity: "warn", message: "class _ui5implements references an interface not declared in this package" },
});

const VALID_DECLARATION_KINDS = new Set(["class", "enum", "interface"]);
const VALID_MEMBER_KINDS = new Set(["field", "method"]);

// helper: push an Issue with severity/message from ISSUE_CODES
function pushIssue(issues, code, { path, entity, extra }) {
	const catalog = ISSUE_CODES[code];
	if (!catalog) {
		// guard against typos — should never happen at runtime, but keeps tests honest
		throw new Error(`unknown WCV code: ${code}`);
	}
	issues.push({
		severity: catalog.severity,
		code,
		message: catalog.message,
		path,
		entity,
		...(extra ? { extra } : {}),
	});
}

// helper: non-empty string check
function isNonEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}

/**
 * Validate the root shape of the manifest.
 * @returns {boolean} `true` when validation may continue (i.e. `manifest.modules`
 *                    is iterable), `false` otherwise.
 */
function validateRoot(manifest, issues) {
	if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
		pushIssue(issues, "WCV000", { path: "$", entity: "<root>" });
		return false;
	}
	if (!Array.isArray(manifest.modules)) {
		pushIssue(issues, "WCV001", { path: "modules", entity: "<root>" });
		return false;
	}
	if (manifest.modules.length === 0) {
		pushIssue(issues, "WCV002", { path: "modules", entity: "<root>" });
	}
	return true;
}

function validateModule(module, moduleIdx, issues) {
	const path = `modules[${moduleIdx}]`;
	const entity = isNonEmptyString(module?.path) ? module.path : path;

	if (module?.kind !== "javascript-module") {
		pushIssue(issues, "WCV010", { path: `${path}.kind`, entity });
	}
	if (!isNonEmptyString(module?.path)) {
		pushIssue(issues, "WCV011", { path: `${path}.path`, entity });
	} else if (module.path.startsWith("/")) {
		pushIssue(issues, "WCV012", { path: `${path}.path`, entity });
	}
	if (module?.declarations !== undefined && !Array.isArray(module.declarations)) {
		pushIssue(issues, "WCV013", { path: `${path}.declarations`, entity });
	}
	if (module?.exports !== undefined && !Array.isArray(module.exports)) {
		pushIssue(issues, "WCV014", { path: `${path}.exports`, entity });
	}
}

function validateClassDecl(decl, declPath, entity, issues) {
	// customElement flag without tagName
	if (decl.customElement === true && !isNonEmptyString(decl.tagName)) {
		pushIssue(issues, "WCV030", { path: `${declPath}.tagName`, entity });
	}
	// superclass shape
	if (decl.superclass !== undefined && decl.superclass !== null) {
		if (typeof decl.superclass === "string") {
			pushIssue(issues, "WCV031", { path: `${declPath}.superclass`, entity, extra: decl.superclass });
		} else if (typeof decl.superclass === "object") {
			if (!isNonEmptyString(decl.superclass.name)) {
				pushIssue(issues, "WCV032", { path: `${declPath}.superclass.name`, entity });
			}
			// `superclass.name` containing dots is the media-chrome / dotted form too —
			// the registry parses it the same way regardless of whether superclass is
			// a bare string or an object with a dotted name. Treat both as WCV031.
			if (isNonEmptyString(decl.superclass.name) && decl.superclass.name.includes(".")) {
				pushIssue(issues, "WCV031", { path: `${declPath}.superclass.name`, entity, extra: decl.superclass.name });
			}
		}
	}
	// array-shaped child collections
	for (const key of ["members", "slots", "events"]) {
		if (decl[key] !== undefined && !Array.isArray(decl[key])) {
			pushIssue(issues, "WCV033", { path: `${declPath}.${key}`, entity, extra: key });
		}
	}
	// members
	if (Array.isArray(decl.members)) {
		decl.members.forEach((member, idx) => validateMember(member, `${declPath}.members[${idx}]`, entity, issues));
	}
	// slots
	if (Array.isArray(decl.slots)) {
		decl.slots.forEach((slot, idx) => validateSlot(slot, `${declPath}.slots[${idx}]`, entity, issues));
		// cross-slot/member check: valueStateMessage slot + no valueState property
		const hasValueStateMessage = decl.slots.some((s) => s?.name === "valueStateMessage");
		const hasValueState = Array.isArray(decl.members) && decl.members.some((m) => m?.kind === "field" && m?.name === "valueState");
		if (hasValueStateMessage && !hasValueState) {
			pushIssue(issues, "WCV052", { path: `${declPath}.slots`, entity });
		}
	}
	// events
	if (Array.isArray(decl.events)) {
		decl.events.forEach((event, idx) => validateEvent(event, `${declPath}.events[${idx}]`, entity, issues));
	}
}

function validateMember(member, memberPath, classEntity, issues) {
	const entity = isNonEmptyString(member?.name) ? `${classEntity}.${member.name}` : `${classEntity}.${memberPath.match(/\[(\d+)\]$/)?.[1] ?? "?"}`;
	if (!member || typeof member !== "object") {
		pushIssue(issues, "WCV041", { path: memberPath, entity });
		return;
	}
	if (!VALID_MEMBER_KINDS.has(member.kind)) {
		pushIssue(issues, "WCV040", { path: `${memberPath}.kind`, entity, extra: String(member.kind) });
	}
	if (!isNonEmptyString(member.name)) {
		pushIssue(issues, "WCV041", { path: `${memberPath}.name`, entity });
	}
	// fields: type.text should be present
	if (member.kind === "field") {
		const typeText = member?.type?.text;
		if (!isNonEmptyString(typeText)) {
			pushIssue(issues, "WCV042", { path: `${memberPath}.type.text`, entity });
		}
		// references must have name
		if (Array.isArray(member?.type?.references)) {
			member.type.references.forEach((ref, idx) => {
				if (!isNonEmptyString(ref?.name)) {
					pushIssue(issues, "WCV043", { path: `${memberPath}.type.references[${idx}].name`, entity });
				}
			});
		}
	}
}

function validateSlot(slot, slotPath, classEntity, issues) {
	const entity = isNonEmptyString(slot?.name) ? `${classEntity}.slots.${slot.name}` : `${classEntity}.${slotPath.match(/\[(\d+)\]$/)?.[1] ?? "?"}`;
	if (!slot || typeof slot !== "object") {
		pushIssue(issues, "WCV050", { path: slotPath, entity });
		return;
	}
	if (!isNonEmptyString(slot.name)) {
		pushIssue(issues, "WCV050", { path: `${slotPath}.name`, entity });
	}
	if (slot._ui5type !== undefined && !isNonEmptyString(slot._ui5type?.text)) {
		pushIssue(issues, "WCV051", { path: `${slotPath}._ui5type.text`, entity });
	}
}

function validateEvent(event, eventPath, classEntity, issues) {
	const entity = isNonEmptyString(event?.name) ? `${classEntity}.events.${event.name}` : `${classEntity}.${eventPath.match(/\[(\d+)\]$/)?.[1] ?? "?"}`;
	if (!event || typeof event !== "object") {
		pushIssue(issues, "WCV060", { path: eventPath, entity });
		return;
	}
	if (!isNonEmptyString(event.name)) {
		pushIssue(issues, "WCV060", { path: `${eventPath}.name`, entity });
	}
	if (event._ui5parameters !== undefined) {
		if (!Array.isArray(event._ui5parameters)) {
			pushIssue(issues, "WCV061", { path: `${eventPath}._ui5parameters`, entity });
		} else {
			event._ui5parameters.forEach((param, idx) => {
				if (!isNonEmptyString(param?.name)) {
					pushIssue(issues, "WCV062", { path: `${eventPath}._ui5parameters[${idx}].name`, entity });
				}
			});
		}
	}
}

function validateInterfaceDecl(decl, declPath, entity, issues) {
	if (!isNonEmptyString(decl.name)) {
		pushIssue(issues, "WCV070", { path: `${declPath}.name`, entity });
	}
}

function validateEnumDecl(decl, declPath, entity, issues) {
	if (!isNonEmptyString(decl.name)) {
		pushIssue(issues, "WCV080", { path: `${declPath}.name`, entity });
	}
	if (decl.members !== undefined) {
		if (!Array.isArray(decl.members)) {
			pushIssue(issues, "WCV081", { path: `${declPath}.members`, entity });
		} else {
			decl.members.forEach((member, idx) => {
				if (!isNonEmptyString(member?.name)) {
					pushIssue(issues, "WCV082", { path: `${declPath}.members[${idx}].name`, entity });
				}
			});
		}
	}
}

function validateExports(module, moduleIdx, declaredClassNames, issues) {
	if (!Array.isArray(module?.exports)) return;
	module.exports.forEach((exportDef, idx) => {
		if (exportDef?.kind === "custom-element-definition") {
			const refName = exportDef?.declaration?.name;
			if (isNonEmptyString(refName) && !declaredClassNames.has(refName)) {
				pushIssue(issues, "WCV022", {
					path: `modules[${moduleIdx}].exports[${idx}].declaration.name`,
					entity: refName,
					extra: refName,
				});
			}
		}
	});
}

/**
 * Validate that classes flagged as exported actually have an `exports[]`
 * entry that names them. If they don't, the registry never assigns
 * `classDef.module` (see WebComponentRegistry#parseExports) and the class
 * ends up effectively orphaned.
 */
function checkClassesWithoutExport(module, moduleIdx, issues) {
	if (!Array.isArray(module?.declarations)) return;
	const exportedNames = new Set();
	if (Array.isArray(module.exports)) {
		for (const exportDef of module.exports) {
			const name = exportDef?.declaration?.name;
			if (isNonEmptyString(name)) exportedNames.add(name);
		}
	}
	module.declarations.forEach((decl, idx) => {
		if (decl?.kind === "class" && isNonEmptyString(decl.name) && !exportedNames.has(decl.name)) {
			pushIssue(issues, "WCV023", {
				path: `modules[${moduleIdx}].declarations[${idx}]`,
				entity: decl.name,
			});
		}
	});
}

/**
 * For every class with `_ui5implements`, verify same-package interfaces are
 * declared somewhere in this manifest. Cross-package references stay the
 * registry's concern.
 */
function crossReferenceImplements(manifest, namespace, issues) {
	const declaredInterfaces = new Set();
	for (const module of manifest.modules) {
		if (!Array.isArray(module?.declarations)) continue;
		for (const decl of module.declarations) {
			if (decl?.kind === "interface" && isNonEmptyString(decl.name)) {
				declaredInterfaces.add(decl.name);
			}
		}
	}
	manifest.modules.forEach((module, moduleIdx) => {
		if (!Array.isArray(module?.declarations)) return;
		module.declarations.forEach((decl, declIdx) => {
			if (decl?.kind !== "class" || !Array.isArray(decl._ui5implements)) return;
			decl._ui5implements.forEach((iface, idx) => {
				const ifaceName = iface?.name;
				const ifacePackage = iface?.package;
				if (!isNonEmptyString(ifaceName)) return;
				// only same-package: cross-package is left to the registry
				const isSamePackage = !ifacePackage || ifacePackage === namespace;
				if (isSamePackage && !declaredInterfaces.has(ifaceName)) {
					pushIssue(issues, "WCV090", {
						path: `modules[${moduleIdx}].declarations[${declIdx}]._ui5implements[${idx}]`,
						entity: `${decl.name ?? "<class>"}._ui5implements.${ifaceName}`,
						extra: ifaceName,
					});
				}
			});
		});
	});
}

/**
 * Compute a per-severity summary from the flat issues list.
 */
function summarize(issues) {
	const summary = { error: 0, warn: 0, info: 0, total: issues.length };
	for (const issue of issues) {
		summary[issue.severity] = (summary[issue.severity] || 0) + 1;
	}
	return summary;
}

/**
 * Validate a Custom Elements Manifest.
 *
 * @param {object} manifest the parsed `custom-elements.json` /
 *                          `custom-elements-internal.json`
 * @param {{namespace: string, metadataPath?: string}} ctx
 * @returns {{issues: Array, summary: {error:number, warn:number, info:number, total:number}, namespace: string, metadataPath: string|undefined}}
 */
function validateManifest(manifest, ctx = {}) {
	const issues = [];
	const namespace = ctx.namespace;
	const metadataPath = ctx.metadataPath;

	if (validateRoot(manifest, issues)) {
		manifest.modules.forEach((module, moduleIdx) => {
			validateModule(module, moduleIdx, issues);

			// per-module declarations
			if (Array.isArray(module?.declarations)) {
				const declaredClassNames = new Set();
				module.declarations.forEach((decl, declIdx) => {
					const declPath = `modules[${moduleIdx}].declarations[${declIdx}]`;
					const entity = isNonEmptyString(decl?.name) ? decl.name : `${declPath}`;

					if (!decl || typeof decl !== "object") {
						pushIssue(issues, "WCV020", { path: declPath, entity });
						return;
					}
					if (!VALID_DECLARATION_KINDS.has(decl.kind)) {
						pushIssue(issues, "WCV020", { path: `${declPath}.kind`, entity, extra: String(decl.kind) });
						return;
					}
					if (!isNonEmptyString(decl.name)) {
						pushIssue(issues, "WCV021", { path: `${declPath}.name`, entity });
					}
					if (decl.kind === "class") {
						if (isNonEmptyString(decl.name)) declaredClassNames.add(decl.name);
						validateClassDecl(decl, declPath, isNonEmptyString(decl.name) ? decl.name : entity, issues);
					} else if (decl.kind === "interface") {
						validateInterfaceDecl(decl, declPath, entity, issues);
					} else if (decl.kind === "enum") {
						validateEnumDecl(decl, declPath, entity, issues);
					}
				});

				validateExports(module, moduleIdx, declaredClassNames, issues);
				checkClassesWithoutExport(module, moduleIdx, issues);
			}
		});

		crossReferenceImplements(manifest, namespace, issues);
	}

	return {
		issues,
		summary: summarize(issues),
		namespace,
		metadataPath,
	};
}

// ---- Reporting ---------------------------------------------------------

const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 };
const SEVERITY_GLYPH = { error: "✗", warn: "⚠", info: "ℹ" };

function pluralize(n, word) {
	return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function formatHeader(namespace, summary) {
	const parts = [pluralize(summary.error, "error"), pluralize(summary.warn, "warning"), pluralize(summary.info, "info")];
	return `[🧬 WCR] Validation for ${namespace ?? "<unknown package>"} (${parts.join(", ")})`;
}

function sortIssues(issues) {
	return [...issues].sort((a, b) => {
		const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
		if (sev !== 0) return sev;
		return a.code.localeCompare(b.code);
	});
}

function formatIssueLine(issue, entityWidth) {
	const glyph = SEVERITY_GLYPH[issue.severity] ?? "•";
	const entity = (issue.entity ?? "").slice(0, 50).padEnd(entityWidth);
	return `  ${glyph} ${issue.code}  ${entity}  ${issue.message}`;
}

/**
 * Render the validation result through a UI5-task-style logger (or any
 * `{info, warn, error}` object). Error-level issues go to `log.error`,
 * warnings to `log.warn`, info to `log.info` (falling back to `log` when
 * the logger has no dedicated info channel).
 *
 * The UI5 `@ui5/logger` Logger relies on `this`-bound private fields, so
 * channel methods are invoked through the original log object rather than
 * being extracted into local variables.
 *
 * @param {Array} issues
 * @param {{error:number, warn:number, info:number, total:number}} summary
 * @param {{namespace: string}} ctx
 * @param {{info?: Function, warn: Function, error: Function, log?: Function}} log
 */
function formatReport(issues, summary, ctx = {}, log = {}) {
	// pick the most specific available channel name; we always call through `log`
	// so the function keeps its `this` (matters for @ui5/logger).
	const infoChan = log.info ? "info" : log.log ? "log" : log.warn ? "warn" : log.error ? "error" : null;
	const warnChan = log.warn ? "warn" : infoChan;
	const errorChan = log.error ? "error" : warnChan;
	const emit = (chan, line) => {
		if (!chan || typeof log[chan] !== "function") return;
		log[chan](line);
	};

	if (!summary || summary.total === 0) {
		emit(infoChan, `[🧬 WCR] Validation OK for ${ctx.namespace ?? "<unknown package>"}`);
		return;
	}

	emit(infoChan, formatHeader(ctx.namespace, summary));

	const sorted = sortIssues(issues);
	const entityWidth = Math.min(50, Math.max(...sorted.map((i) => (i.entity ?? "").length), 1));

	for (const issue of sorted) {
		const line = formatIssueLine(issue, entityWidth);
		if (issue.severity === "error") emit(errorChan, line);
		else if (issue.severity === "warn") emit(warnChan, line);
		else emit(infoChan, line);
	}
}

module.exports = {
	validateManifest,
	formatReport,
	ISSUE_CODES,
};
