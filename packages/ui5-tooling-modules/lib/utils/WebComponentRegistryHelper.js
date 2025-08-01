const WebComponentRegistryHelper = {
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
		return ui5Superclass.namespace === "@ui5/webcomponents-base" && ui5Superclass.name === "UI5Element";
	},

	isUi5CoreHTMLElement(ui5Superclass) {
		return ui5Superclass?.namespace === "sap.ui.core.html" && ui5Superclass?.name === "HTMLElement";
	},
};

module.exports = WebComponentRegistryHelper;
