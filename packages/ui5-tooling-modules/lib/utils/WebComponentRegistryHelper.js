const WebComponentRegistryHelper = {
	// the class name of the base class of all control wrappers
	// corresponds to the "sap.ui.core.webc.WebComponent" class at runtime.
	UI5_ELEMENT_CLASS_NAME: "UI5Element",
	UI5_ELEMENT_NAMESPACE: "@ui5/webcomponents-base",

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

	isWebComponent(ui5Superclass) {
		return ui5Superclass.name === "sap.ui.core.webc.WebComponent";
	},
};

module.exports = WebComponentRegistryHelper;
