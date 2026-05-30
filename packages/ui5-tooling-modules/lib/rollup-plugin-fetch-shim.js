// Rollup plugin that replaces server-only fetch packages (`node-fetch`,
// `cross-fetch`, `isomorphic-fetch`, etc.) with a tiny virtual module that
// re-exports the browser's native Web Fetch API.
//
// Why: those packages are designed for Node and pull in `node:net`,
// `node:fs/promises`, `fetch-blob`, `formdata-polyfill`, and more — none of
// which polyfill cleanly into a browser bundle. Modern browsers have a global
// `fetch` API for years now, and in the UI5 runtime `globalThis.fetch` is
// always available. This plugin short-circuits the resolution before
// rollup-plugin-polyfill-node even sees the imports.
//
// The shim covers:
//   - the package's "main" entry  (e.g. `import fetch from "node-fetch"`)
//   - any subpath import          (e.g. `import {fetch} from "cross-fetch/polyfill"`)
//
// Consumers needing Node-specific helpers (`AbortError`, `FetchError`,
// `isRedirect`, `blobFrom`, `fileFrom`) get inert stubs so the import
// itself does not throw at parse time.

const VIRTUAL_PREFIX = "\0fetch-shim:";

// The list of packages we intercept. Subpath imports
// (`<pkg>` or `<pkg>/...`) all funnel into the same shim — the shim only
// re-exports the Web Fetch API, so the subpath is irrelevant to the result.
const SHIMMED_PACKAGES = ["node-fetch", "cross-fetch", "isomorphic-fetch"];

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

/**
 * @param {object} [options]
 * @param {string[]} [options.packages] override the list of packages to shim
 * @param {function} [options.log] logger for tracing the interception
 * @returns {import('rollup').Plugin}
 */
module.exports = function fetchShim({ packages = SHIMMED_PACKAGES, log } = {}) {
	const shimRegex = new RegExp(`^(${packages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:/.*)?$`);

	return {
		name: "fetch-shim",
		resolveId(importee) {
			if (shimRegex.test(importee)) {
				log?.verbose?.(`fetch-shim: intercepted import "${importee}" -> globalThis.fetch shim`);
				// Use a single virtual id so rollup deduplicates the shim across
				// every (pkg, subpath) variant in the graph.
				return { id: `${VIRTUAL_PREFIX}index.js`, moduleSideEffects: false };
			}
			return null;
		},
		load(id) {
			if (id.startsWith(VIRTUAL_PREFIX)) {
				return SHIM_SOURCE;
			}
			return null;
		},
	};
};

module.exports.SHIMMED_PACKAGES = SHIMMED_PACKAGES;
