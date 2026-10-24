/**
 * Rollup plugin: replace server-only fetch/form-data packages with browser shims.
 *
 * Intercepts `node-fetch`, `cross-fetch`, `isomorphic-fetch` (and any of
 * their subpath imports, e.g. `cross-fetch/polyfill`) and substitutes a tiny
 * virtual module that re-exports the browser's native Web Fetch API.
 *
 * Also intercepts `isomorphic-form-data`, which has a Node entry that pulls in
 * `form-data` → `es-set-tostringtag` → `get-intrinsic` → `es-object-atoms` /
 * `hasown`, none of which are resolvable from the UI5 application context in a
 * pnpm isolated workspace. The browser entry of `isomorphic-form-data` is simply
 * `module.exports = window.FormData`, so the shim re-exports `globalThis.FormData`.
 *
 * Why: those packages are designed for Node and drag in `node:net`,
 * `node:fs/promises`, `fetch-blob`, `formdata-polyfill`, and more — none of
 * which polyfill cleanly into a browser bundle. Modern browsers have a
 * global `fetch` for years, and in the UI5 runtime `globalThis.fetch` is
 * always available. Intercepting at `resolveId` short-circuits resolution
 * before commonjs / polyfill-node ever see the import, so the entire
 * Node-only sub-graph drops out of the bundle.
 *
 * The fetch shim re-exports `fetch`, `Headers`, `Request`, `Response`, `Blob`,
 * `File`, `FormData`, `AbortController`, and `AbortSignal` from
 * `globalThis`, plus inert `AbortError` / `FetchError` / `isRedirect` stubs
 * for compatibility. Node-only helpers (`blobFrom`, `fileFrom`, ...) are
 * stubbed to throw an explanatory error if invoked.
 *
 * @param {object}   [options]
 * @param {string[]} [options.packages] override the default list of
 *        intercepted fetch packages (default: `node-fetch`, `cross-fetch`,
 *        `isomorphic-fetch`)
 * @param {string[]} [options.formDataPackages] override the default list of
 *        intercepted form-data packages (default: `isomorphic-form-data`)
 * @param {{ verbose?: (msg: string) => void }} [options.log]
 *        optional logger; `verbose` is called for every interception
 * @returns {import('rollup').Plugin}
 */

const VIRTUAL_PREFIX = "\0fetch-shim:";

// Fetch-like packages: default export is the fetch function.
const SHIMMED_PACKAGES = ["node-fetch", "cross-fetch", "isomorphic-fetch"];

// FormData-like packages: default export is the FormData constructor.
const SHIMMED_FORM_DATA_PACKAGES = ["isomorphic-form-data"];

const FORM_DATA_SHIM_SOURCE = `// isomorphic-form-data shim emitted by ui5-tooling-modules.
// Re-exports the browser's native FormData. See rollup-plugin-fetch-shim.js
// in ui5-tooling-modules for rationale.
export default globalThis.FormData;
`;

const SHIM_SOURCE = `// node-fetch / cross-fetch / isomorphic-fetch shim emitted by ui5-tooling-modules.
// Re-exports the browser's native Web Fetch API. See rollup-plugin-fetch-shim.js
// in ui5-tooling-modules for rationale.
const _fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : undefined;
const _Headers = globalThis.Headers;
const _Request = globalThis.Request;
const _Response = globalThis.Response;
const _Blob = globalThis.Blob;
const _File = globalThis.File;
const _FormData = globalThis.FormData;
const _AbortController = globalThis.AbortController;
const _AbortSignal = globalThis.AbortSignal;

class AbortError extends Error {
	constructor(message) {
		super(message);
		this.name = "AbortError";
		this.type = "aborted";
	}
}

class FetchError extends Error {
	constructor(message, type, systemError) {
		super(message);
		this.name = "FetchError";
		this.type = type;
		if (systemError) {
			this.code = this.errno = systemError.code;
			this.erroredSysCall = systemError.syscall;
		}
	}
}

const _isRedirect = (code) => [301, 302, 303, 307, 308].includes(code);

// Node-only helpers — kept as stubs so static imports do not throw at parse
// time. They explicitly fail if invoked so the call site is easy to find.
const _nodeOnly = (name) => () => {
	throw new Error("[ui5-tooling-modules] " + name + " is not available in the browser; use the native Web Fetch API instead.");
};

export default _fetch;
export {
	_fetch as fetch,
	_Headers as Headers,
	_Request as Request,
	_Response as Response,
	_Blob as Blob,
	_File as File,
	_FormData as FormData,
	_AbortController as AbortController,
	_AbortSignal as AbortSignal,
	AbortError,
	FetchError,
	_isRedirect as isRedirect,
};

export const blobFrom = _nodeOnly("blobFrom");
export const blobFromSync = _nodeOnly("blobFromSync");
export const fileFrom = _nodeOnly("fileFrom");
export const fileFromSync = _nodeOnly("fileFromSync");
`;

module.exports = function fetchShim({ packages = SHIMMED_PACKAGES, formDataPackages = SHIMMED_FORM_DATA_PACKAGES, log } = {}) {
	const shimRegex = new RegExp(`^(${packages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:/.*)?$`);
	const formDataRegex = new RegExp(`^(${formDataPackages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:/.*)?$`);

	return {
		name: "fetch-shim",
		resolveId(importee) {
			if (shimRegex.test(importee)) {
				log?.verbose?.(`fetch-shim: intercepted import "${importee}" -> globalThis.fetch shim`);
				// Use a single virtual id so rollup deduplicates the shim across
				// every (pkg, subpath) variant in the graph.
				return { id: `${VIRTUAL_PREFIX}index.js`, moduleSideEffects: false };
			}
			if (formDataRegex.test(importee)) {
				log?.verbose?.(`fetch-shim: intercepted import "${importee}" -> globalThis.FormData shim`);
				return { id: `${VIRTUAL_PREFIX}form-data.js`, moduleSideEffects: false };
			}
			return null;
		},
		load(id) {
			if (id === `${VIRTUAL_PREFIX}index.js`) {
				return SHIM_SOURCE;
			}
			if (id === `${VIRTUAL_PREFIX}form-data.js`) {
				return FORM_DATA_SHIM_SOURCE;
			}
			return null;
		},
	};
};

module.exports.SHIMMED_PACKAGES = SHIMMED_PACKAGES;
module.exports.SHIMMED_FORM_DATA_PACKAGES = SHIMMED_FORM_DATA_PACKAGES;
