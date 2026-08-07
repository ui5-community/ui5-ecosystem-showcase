const path = require("path");
const fs = require("fs");

/**
 * Tracks which XML views (and fragments) embed which fragments, so a changed
 * `*.fragment.xml` can be hot-swapped by re-instantiating the view(s) that render it.
 *
 * UI5 views/fragments reference an embedded fragment declaratively via
 * `<core:Fragment fragmentName="my.app.view.Frag" ... />` (dot notation). We parse those
 * references across all `*.view.xml` / `*.fragment.xml` files, then answer: "given this
 * changed fragment, which VIEWS (transitively) embed it?" — because only views have a live
 * instance we can re-instantiate. Fragments embedding fragments are followed transitively
 * up to the enclosing view(s).
 *
 * <b>Scope + caveats (prototype):</b>
 * - Only declaratively embedded fragments are tracked. Fragments loaded imperatively in a
 *   controller (`Fragment.load(...)`, typically for dialogs) have no view to re-instantiate
 *   and are not covered — the caller falls back to a full reload for those.
 * - `fragmentName` is matched as a static string attribute; computed names are not tracked.
 */

// <... Fragment ... fragmentName="a.b.C" ...>  (attribute order independent, quotes either)
const FRAGMENT_REF_RE = /fragmentName\s*=\s*(['"])([^'"]+)\1/g;

/**
 * Extracts embedded fragment names (dot notation) referenced by an XML source.
 *
 * @param {string} source XML view/fragment source
 * @returns {string[]} referenced fragment names in dot notation
 */
const extractFragmentRefs = (source) => {
	const refs = [];
	let m;
	FRAGMENT_REF_RE.lastIndex = 0;
	while ((m = FRAGMENT_REF_RE.exec(source)) !== null) {
		refs.push(m[2]);
	}
	return refs;
};

class ViewGraph {
	/**
	 * @param {string} webappPath absolute path to the app's webapp root
	 * @param {string} namespace app namespace as a slash path (e.g. `my/app`)
	 */
	constructor(webappPath, namespace) {
		this._webappPath = webappPath;
		this._namespace = namespace;
		// UI5 "name" (dot notation) of every view/fragment -> { isView, embeds:Set(fragmentName) }
		this._nodes = new Map();
	}

	/**
	 * Maps a webapp-relative POSIX path to a UI5 name (dot notation) + kind, or null if the
	 * file is not an XML view/fragment.
	 *
	 * @param {string} relPosix path relative to webapp root, POSIX separators
	 * @returns {{name: string, isView: boolean}|null} node descriptor
	 */
	relToNode(relPosix) {
		if (!/\.(view|fragment)\.xml$/i.test(relPosix)) {
			return null;
		}
		const isView = /\.view\.xml$/i.test(relPosix);
		const base = relPosix.replace(/\.(view|fragment)\.xml$/i, "");
		const full = this._namespace ? `${this._namespace}/${base}` : base;
		return { name: full.replace(/\//g, "."), isView: isView };
	}

	/**
	 * Records/refreshes the embedded-fragment edges for one view/fragment.
	 *
	 * @param {string} name UI5 name (dot notation)
	 * @param {boolean} isView whether this node is a view (vs a fragment)
	 * @param {string} source XML source
	 */
	updateNode(name, isView, source) {
		this._nodes.set(name, { isView: isView, embeds: new Set(extractFragmentRefs(source)) });
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
				} else if (/\.(view|fragment)\.xml$/i.test(entry.name)) {
					const relPosix = path.relative(this._webappPath, abs).split(path.sep).join(path.posix.sep);
					const node = this.relToNode(relPosix);
					if (node) {
						try {
							this.updateNode(node.name, node.isView, fs.readFileSync(abs, "utf-8"));
						} catch {
							/* ignore unreadable files */
						}
					}
				}
			}
		};
		walk(this._webappPath);
	}

	/**
	 * Given a changed fragment name, returns the UI5 names of all VIEWS that embed it,
	 * directly or transitively (fragment embeds fragment embeds ... embeds-in view).
	 *
	 * @param {string} fragmentName UI5 name (dot notation) of the changed fragment
	 * @returns {string[]} view names (dot notation) to re-instantiate
	 */
	viewsEmbedding(fragmentName) {
		const views = new Set();
		const seen = new Set();
		const stack = [fragmentName];
		while (stack.length) {
			const target = stack.pop();
			if (seen.has(target)) {
				continue;
			}
			seen.add(target);
			// any node that embeds `target`
			for (const [name, node] of this._nodes) {
				if (node.embeds.has(target)) {
					if (node.isView) {
						views.add(name);
					} else {
						// a fragment embedding the target — climb toward its enclosing view(s)
						stack.push(name);
					}
				}
			}
		}
		return Array.from(views);
	}
}

module.exports = { ViewGraph, extractFragmentRefs };
