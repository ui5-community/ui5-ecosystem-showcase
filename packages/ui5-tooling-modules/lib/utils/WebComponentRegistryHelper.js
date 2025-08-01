const WebComponentRegistryHelper = {
	// the class name of the base class of all control wrappers
	// corresponds to the "sap.ui.core.webc.WebComponent" class at runtime.
	UI5_ELEMENT_CLASS_NAME: "UI5Element",
	UI5_ELEMENT_NAMESPACE: "@ui5/webcomponents-base",

	/**
	 * Helper function to check whether the given class inherits from the provided class name.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
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

	isUI5Element(ui5Superclass) {
		return ui5Superclass.namespace === this.UI5_ELEMENT_NAMESPACE && ui5Superclass.name === this.UI5_ELEMENT_CLASS_NAME;
	},

	isUi5CoreHTMLElement(ui5Superclass) {
		return ui5Superclass?.namespace === "sap.ui.core.html" && ui5Superclass?.name === "HTMLElement";
	},
};

module.exports = WebComponentRegistryHelper;
