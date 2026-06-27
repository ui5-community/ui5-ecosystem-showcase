const SimpleLogger = require("./SimpleLogger");

const logger = SimpleLogger.create("🧬 WCR");

const WebComponentRegistryHelper = {
	// the class name of the base class of all control wrappers
	// corresponds to the "sap.ui.core.webc.WebComponent" class at runtime.
	UI5_ELEMENT_CLASS_NAME: "UI5Element",
	UI5_ELEMENT_NAMESPACE: "@ui5/webcomponents-base",
	UI5_ELEMENT_MODULE: "dist/UI5Element.js",

	/**
	 * Helper function to check whether the given class inherits from UI5Element, the base class for all
	 * UI5 web components.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @returns {boolean} whether the class inherits from UI5Element
	 */
	isUI5ElementSubclass(classDef) {
		let superclass = classDef.superclass,
			isUI5ElementSubclass = false;
		while (superclass) {
			if (superclass?.namespace === this.UI5_ELEMENT_NAMESPACE && superclass?.name === this.UI5_ELEMENT_CLASS_NAME) {
				isUI5ElementSubclass = true;
				break;
			}
			superclass = superclass.superclass;
		}
		return isUI5ElementSubclass;
	},

	isUI5Element(ui5Superclass) {
		return ui5Superclass.namespace === this.UI5_ELEMENT_NAMESPACE && ui5Superclass.name === this.UI5_ELEMENT_CLASS_NAME;
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
};

WebComponentRegistryHelper.UI5_ELEMENT_CACHE_KEY = WebComponentRegistryHelper.deriveCacheKey({
	module: WebComponentRegistryHelper.UI5_ELEMENT_MODULE,
	name: WebComponentRegistryHelper.UI5_ELEMENT_CLASS_NAME,
});

module.exports = WebComponentRegistryHelper;
