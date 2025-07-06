const WebComponentRegistryHelper = {
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
			if (superclass?.namespace === "@ui5/webcomponents-base" && superclass?.name === "UI5Element") {
				isUI5ElementSubclass = true;
				break;
			}
			superclass = superclass.superclass;
		}
		return isUI5ElementSubclass;
	},

	isUI5Element(ui5Superclass) {
		return ui5Superclass.namespace === "@ui5/webcomponents-base" && ui5Superclass.name === "UI5Element";
	},
};

module.exports = WebComponentRegistryHelper;
