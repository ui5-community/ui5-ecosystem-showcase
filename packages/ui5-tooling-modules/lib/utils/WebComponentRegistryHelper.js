const SimpleLogger = require("./SimpleLogger");

const logger = SimpleLogger.create("🧬 WCR");

const WebComponentRegistryHelper = {
	// the class name of the base class of all control wrappers
	// corresponds to the "sap.ui.core.webc.WebComponent" class at runtime.
	UI5_ELEMENT_CLASS_NAME: "UI5Element",
	UI5_ELEMENT_NAMESPACE: "@ui5/webcomponents-base",
	UI5_ELEMENT_MODULE: "dist/UI5Element.js",

	/**
	 * Helper function to check whether the given class inherits from the provided class name.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @param {string} namespace the class namespace
	 * @param {string} className the class name
	 * @returns {boolean} whether the class inherits from the provided class name
	 */
	isSubclassOf(classDef, namespace, className) {
		let superclass = classDef.superclass,
			isSubclass = false;
		while (superclass) {
			if (superclass?.namespace === namespace && superclass?.name === className) {
				isSubclass = true;
				break;
			}
			superclass = superclass.superclass;
		}
		return isSubclass;
	},

	/**
	 * Helper function to check whether the given class inherits from UI5Element, the base class for all
	 * UI5 web components.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @returns {boolean} whether the class inherits from UI5Element
	 */
	isUI5ElementSubclass(classDef) {
		return this.isSubclassOf(classDef, this.UI5_ELEMENT_NAMESPACE, this.UI5_ELEMENT_CLASS_NAME);
	},

	isUI5Element(ui5Superclass) {
		return ui5Superclass.namespace === this.UI5_ELEMENT_NAMESPACE && ui5Superclass.name === this.UI5_ELEMENT_CLASS_NAME;
	},

	/**
	 * Checks whether the class def is a core HTML element.
	 */
	isUi5CoreHTMLElement(ui5Superclass) {
		return ui5Superclass?.namespace === "sap.ui.core.html" && ui5Superclass?.name === "HTMLElement";
	},

	/**
	 * Checks whether the given class definition represents an actual custom Web Component.
	 *
	 * A class is considered a custom element when it carries the <code>customElement</code> flag from
	 * the custom-elements manifest (and is not the <code>UI5Element</code> base class itself, which is
	 * paradoxically also flagged as a custom element in the metadata but is a base class, not a usable
	 * component), OR when any ancestor in its superclass chain is one.
	 *
	 * The inherited case is reported via a warning so the upstream <code>custom-elements.json</code> can
	 * be fixed to flag the subclass directly.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @returns {boolean} whether the class is (or inherits from) a custom Web Component
	 */
	isCustomElement(classDef) {
		if (!classDef) {
			return false;
		}
		// direct flag — the common case
		if (classDef.customElement && !this.isUI5Element(classDef)) {
			return true;
		}
		// inherited: walk the superclass chain, ignoring the UI5Element base class itself
		let superclass = classDef.superclass;
		while (superclass) {
			if (superclass.customElement && !this.isUI5Element(superclass)) {
				logger.warn(
					`The class '${classDef.namespace ?? "?"}/${classDef.name}' is treated as a custom element because its ancestor '${superclass.namespace ?? "?"}/${superclass.name}' is flagged as one. Please mark '${classDef.name}' as 'customElement: true' in the custom-elements manifest.`,
				);
				return true;
			}
			superclass = superclass.superclass;
		}
		return false;
	},

	isWebComponent(ui5Superclass) {
		return ui5Superclass.name === "sap.ui.core.webc.WebComponent";
	},

	/**
	 * Derives the cache key needed for the registry to store each entity:
	 *   - classes
	 *   - enums
	 *   - interfaces
	 * @param {object} keyDef the key info
	 * @param {object} keyDef.module the module which contains the entity
	 * @param {object} keyDef.name the name of the entity, e.g. a class or enum name
	 * @returns {string|undefined} a combined cache key or <code>undefined</code> in case we could not derive a cache key
	 */
	deriveCacheKey(keyDef) {
		if (keyDef?.module) {
			const delimiter = ">>";
			return `${keyDef.module}${delimiter}${keyDef.name}`;
		} else {
			return undefined;
		}
	},

	// matches a syntactically valid JavaScript identifier (ASCII subset)
	JS_IDENTIFIER_RE: /^[$A-Z_a-z][$\w]*$/,

	/**
	 * Derives the local variable name used for a control wrapper class in the generated code.
	 *
	 * The name is normally the last segment of the class' qualified UI5 name, which mirrors the
	 * module file basename. Because it is emitted verbatim as a <code>const</code> identifier, it
	 * must be a valid JavaScript identifier. If the derived segment is not (e.g. a module file name
	 * containing a hyphen), we fall back to the declared class name, which is a real ES export
	 * identifier. If neither yields a valid identifier we throw, since the generated code would
	 * otherwise fail to parse.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @returns {string} a valid JavaScript identifier to use as the wrapper's local variable name
	 */
	deriveClassVariableName(classDef) {
		const simpleName = classDef?._ui5QualifiedName?.split(".").pop();
		if (simpleName && this.JS_IDENTIFIER_RE.test(simpleName)) {
			return simpleName;
		}
		if (classDef?.name && this.JS_IDENTIFIER_RE.test(classDef.name)) {
			logger.warn(`Derived class name '${simpleName}' is not a valid JavaScript identifier; using the declared class name '${classDef.name}' instead.`);
			return classDef.name;
		}
		throw new Error(`Cannot derive a valid JavaScript identifier for class '${classDef?._ui5QualifiedName ?? classDef?.name}'.`);
	},
};

WebComponentRegistryHelper.UI5_ELEMENT_CACHE_KEY = WebComponentRegistryHelper.deriveCacheKey({
	module: WebComponentRegistryHelper.UI5_ELEMENT_MODULE,
	name: WebComponentRegistryHelper.UI5_ELEMENT_CLASS_NAME,
});

module.exports = WebComponentRegistryHelper;
