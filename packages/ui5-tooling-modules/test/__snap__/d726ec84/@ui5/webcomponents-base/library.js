sap.ui.define(['sap/base/strings/hyphenate', 'sap/ui/core/webc/WebComponentRenderer', 'sap/ui/core/Lib', 'sap/ui/base/DataType'], (function (hyphenate, WebComponentRenderer, Library, DataType) { 'use strict';

	// Fixed with https://github.com/SAP/openui5/commit/7a4615e3fe55221ae9de9d876d3eed209f71a5b1 in UI5 1.128.0


	WebComponentRenderer.renderAttributeProperties = function (oRm, oWebComponent) {
		var oAttrProperties = oWebComponent.getMetadata().getPropertiesByMapping("property");
		// ##### MODIFICATION START #####
		var aPropsToAlwaysSet = ["enabled"].concat(
			Object.entries(oWebComponent.getMetadata().getPropertyDefaults()).map(([key, value]) => {
				return value !== undefined && value !== false ? key : null;
			})
		); // some properties can be initial and still have a non-default value due to side effects (e.g. EnabledPropagator)
		// ##### MODIFICATION END #####
		for (var sPropName in oAttrProperties) {
			if (oWebComponent.isPropertyInitial(sPropName) && !aPropsToAlwaysSet.includes(sPropName)) {
				continue; // do not set attributes for properties that were not explicitly set or bound
			}

			var oPropData = oAttrProperties[sPropName];
			var vPropValue = oPropData.get(oWebComponent);
			if (oPropData.type === "object" || typeof vPropValue === "object") {
				continue; // Properties of type "object" and custom-type properties with object values are set during onAfterRendering
			}

			var sAttrName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
			if (oPropData._fnMappingFormatter) {
				vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
			}

			if (oPropData.type === "boolean") {
				if (vPropValue) {
					oRm.attr(sAttrName, "");
				}
			} else {
				if (vPropValue != null) {
					oRm.attr(sAttrName, vPropValue);
				}
			}
		}
	};

	const theLibrary = Library.init({
	  "apiVersion": 2,
	  "name": "@ui5/webcomponents-base",
	  "dependencies": [
	    "sap.ui.core"
	  ],
	  "types": [
	    "@ui5/webcomponents-base.AnimationMode",
	    "@ui5/webcomponents-base.AriaHasPopup",
	    "@ui5/webcomponents-base.AriaRole",
	    "@ui5/webcomponents-base.CalendarType",
	    "@ui5/webcomponents-base.ItemNavigationBehavior",
	    "@ui5/webcomponents-base.MovePlacement",
	    "@ui5/webcomponents-base.NavigationMode",
	    "@ui5/webcomponents-base.ValueState"
	  ],
	  "elements": [],
	  "controls": [],
	  "interfaces": [],
	  "designtime": "@ui5/webcomponents-base/designtime/library.designtime",
	  "extensions": {
	    "flChangeHandlers": {
	      "@ui5/webcomponents.Avatar": {
	        "hideControl": "default",
	        "unhideControl": "default"
	      },
	      "@ui5/webcomponents.Button": "@ui5/webcomponents-flexibility.Button"
	    }
	  },
	  "noLibraryCSS": true
	});

	theLibrary["AnimationMode"] = {
		"Full": "Full",
		"Basic": "Basic",
		"Minimal": "Minimal",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AnimationMode", theLibrary["AnimationMode"]);
	theLibrary["AriaHasPopup"] = {
		"Dialog": "Dialog",
		"Grid": "Grid",
		"ListBox": "ListBox",
		"Menu": "Menu",
		"Tree": "Tree",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AriaHasPopup", theLibrary["AriaHasPopup"]);
	theLibrary["AriaRole"] = {
		"AlertDialog": "AlertDialog",
		"Button": "Button",
		"Dialog": "Dialog",
		"Link": "Link",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AriaRole", theLibrary["AriaRole"]);
	theLibrary["CalendarType"] = {
		"Gregorian": "Gregorian",
		"Islamic": "Islamic",
		"Japanese": "Japanese",
		"Buddhist": "Buddhist",
		"Persian": "Persian",
	};
	DataType.registerEnum("@ui5/webcomponents-base.CalendarType", theLibrary["CalendarType"]);
	theLibrary["ItemNavigationBehavior"] = {
		"Static": "Static",
		"Cyclic": "Cyclic",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ItemNavigationBehavior", theLibrary["ItemNavigationBehavior"]);
	theLibrary["MovePlacement"] = {
		"On": "On",
		"Before": "Before",
		"After": "After",
	};
	DataType.registerEnum("@ui5/webcomponents-base.MovePlacement", theLibrary["MovePlacement"]);
	theLibrary["NavigationMode"] = {
		"Auto": "Auto",
		"Vertical": "Vertical",
		"Horizontal": "Horizontal",
		"Paging": "Paging",
	};
	DataType.registerEnum("@ui5/webcomponents-base.NavigationMode", theLibrary["NavigationMode"]);
	theLibrary["ValueState"] = {
		"None": "None",
		"Positive": "Positive",
		"Critical": "Critical",
		"Negative": "Negative",
		"Information": "Information",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ValueState", theLibrary["ValueState"]);

	return theLibrary;

}));
