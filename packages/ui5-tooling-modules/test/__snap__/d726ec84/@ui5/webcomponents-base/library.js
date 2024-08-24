sap.ui.define(['sap/ui/core/Lib', 'sap/ui/base/DataType'], (function (Library, DataType) { 'use strict';

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
