const path = require("path");
const fs = require("fs");

/**
 * Lightweight static dependency graph for a UI5 app's own modules.
 *
 * Parses the dependency array of `sap.ui.define` / `sap.ui.predefine` calls to learn
 * which modules each module depends on, then inverts that into a reverse graph so we
 * can answer: "when module M changes, which already-loaded modules captured a reference
 * to it and therefore need to be unloaded too?".
 *
 * <b>Scope + caveats (prototype):</b>
 * - Only the app's own modules (under the app namespace) are scanned; framework modules
 *   can't be hot-swapped anyway.
 * - Dependency extraction is a pragmatic regex over the first array literal passed to
 *   `define`. It handles the common case (a static string array). Computed dependency
 *   lists or `sap.ui.require([...])` inside function bodies are not tracked.
 */

// matches sap.ui.define( ["a","b"], ...  and sap.ui.predefine("name", ["a","b"], ...
const DEFINE_RE = /sap\.ui\.(?:define|predefine)\s*\(\s*(?:(['"])(?:[^'"]*)\1\s*,\s*)?\[([^\]]*)\]/;
const DEP_RE = /(['"])([^'"]+)\1/g;

/**
 * Extracts the declared dependencies from a module's source.
 *
 * @param {string} source module source code
 * @returns {string[]} raw dependency names as written in the define array
 */
const extractDeps = (source) => {
	const m = DEFINE_RE.exec(source);
	if (!m) {
		return [];
	}
	const deps = [];
	let d;
	DEP_RE.lastIndex = 0;
	while ((d = DEP_RE.exec(m[2])) !== null) {
		deps.push(d[2]);
	}
	return deps;
};

/**
 * Resolves a (possibly relative) dependency name against the requiring module.
 *
 * @param {string} dep dependency as written in the define array
 * @param {string} fromModule slash-path module name doing the requiring (e.g. `my/app/controller/Main`)
 * @returns {string} resolved slash-path module name
 */
const resolveDep = (dep, fromModule) => {
	if (dep.startsWith("./") || dep.startsWith("../")) {
		const baseDir = path.posix.dirname(fromModule);
		return path.posix.normalize(path.posix.join(baseDir, dep));
	}
	return dep;
};

class DepGraph {
	/**
	 * @param {string} webappPath absolute path to the app's webapp root
	 * @param {string} namespace app namespace as a slash path (e.g. `my/app`)
	 */
	constructor(webappPath, namespace) {
		this._webappPath = webappPath;
		this._namespace = namespace;
		/** module -> Set(deps it declares) that belong to this app */
		this._forward = new Map();
		/** module -> Set(modules that declare it as a dep) */
		this._reverse = new Map();
	}

	/**
	 * Maps a webapp-relative POSIX path to a slash-path module name, or null if not a module.
	 *
	 * @param {string} relPosix path relative to webapp root, POSIX separators
	 * @returns {string|null} module name
	 */
	relToModule(relPosix) {
		const ext = path.posix.extname(relPosix).toLowerCase();
		if (ext !== ".js" && ext !== ".ts") {
			return null;
		}
		const noExt = relPosix.slice(0, relPosix.length - ext.length);
		return this._namespace ? `${this._namespace}/${noExt}` : noExt;
	}

	/**
	 * Records/refreshes the forward edges for a single module from its source.
	 *
	 * @param {string} moduleName slash-path module name
	 * @param {string} source module source code
	 */
	updateModule(moduleName, source) {
		const resolved = extractDeps(source)
			.map((dep) => resolveDep(dep, moduleName))
			// keep only edges to this app's own modules
			.filter((dep) => !this._namespace || dep === this._namespace || dep.startsWith(this._namespace + "/"));
		this._forward.set(moduleName, new Set(resolved));
		this._rebuildReverse();
	}

	_rebuildReverse() {
		this._reverse = new Map();
		for (const [mod, deps] of this._forward) {
			for (const dep of deps) {
				if (!this._reverse.has(dep)) {
					this._reverse.set(dep, new Set());
				}
				this._reverse.get(dep).add(mod);
			}
		}
	}

	/**
	 * Scans the whole webapp once to populate the graph.
	 */
	build() {
		const walk = (dir) => {
			let entries;
			try {
				entries = fs.readdirSync(dir, { withFileTypes: true });
			} catch {
				return;
			}
			for (const entry of entries) {
				const abs = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					if (entry.name === "node_modules" || entry.name.startsWith(".")) {
						continue;
					}
					walk(abs);
				} else if (/\.(js|ts)$/i.test(entry.name)) {
					const relPosix = path.relative(this._webappPath, abs).split(path.sep).join(path.posix.sep);
					const moduleName = this.relToModule(relPosix);
					if (moduleName) {
						try {
							this.updateModuleNoRebuild(moduleName, fs.readFileSync(abs, "utf-8"));
						} catch {
							/* ignore unreadable files */
						}
					}
				}
			}
		};
		walk(this._webappPath);
		this._rebuildReverse();
	}

	/**
	 * Like updateModule but defers the reverse rebuild (used during bulk build()).
	 *
	 * @param {string} moduleName slash-path module name
	 * @param {string} source module source code
	 */
	updateModuleNoRebuild(moduleName, source) {
		const resolved = extractDeps(source)
			.map((dep) => resolveDep(dep, moduleName))
			.filter((dep) => !this._namespace || dep === this._namespace || dep.startsWith(this._namespace + "/"));
		this._forward.set(moduleName, new Set(resolved));
	}

	/**
	 * Computes the transitive set of modules that (directly or indirectly) depend on the
	 * given module. The changed module itself is not included.
	 *
	 * @param {string} moduleName slash-path module name that changed
	 * @returns {string[]} transitive dependents, nearest first is not guaranteed
	 */
	transitiveDependents(moduleName) {
		const result = new Set();
		const stack = [moduleName];
		while (stack.length) {
			const current = stack.pop();
			const dependents = this._reverse.get(current);
			if (dependents) {
				for (const dep of dependents) {
					if (!result.has(dep) && dep !== moduleName) {
						result.add(dep);
						stack.push(dep);
					}
				}
			}
		}
		return Array.from(result);
	}
}

module.exports = { DepGraph, extractDeps, resolveDep };
