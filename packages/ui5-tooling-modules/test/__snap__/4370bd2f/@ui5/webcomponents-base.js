sap.ui.define(['sap/ui/base/DataType'], (function (DataType) { 'use strict';

	const pkg = {
		"_ui5metadata": {
	  "name": "@ui5/webcomponents-base",
	  "version": "2.1.2",
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
	  "interfaces": [],
	  "controls": [],
	  "elements": []
	}
	};

	pkg["AnimationMode"] = {
		"Full": "Full",
		"Basic": "Basic",
		"Minimal": "Minimal",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AnimationMode", pkg["AnimationMode"]);
	pkg["AriaHasPopup"] = {
		"Dialog": "Dialog",
		"Grid": "Grid",
		"ListBox": "ListBox",
		"Menu": "Menu",
		"Tree": "Tree",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AriaHasPopup", pkg["AriaHasPopup"]);
	pkg["AriaRole"] = {
		"AlertDialog": "AlertDialog",
		"Button": "Button",
		"Dialog": "Dialog",
		"Link": "Link",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AriaRole", pkg["AriaRole"]);
	pkg["CalendarType"] = {
		"Gregorian": "Gregorian",
		"Islamic": "Islamic",
		"Japanese": "Japanese",
		"Buddhist": "Buddhist",
		"Persian": "Persian",
	};
	DataType.registerEnum("@ui5/webcomponents-base.CalendarType", pkg["CalendarType"]);
	pkg["ItemNavigationBehavior"] = {
		"Static": "Static",
		"Cyclic": "Cyclic",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ItemNavigationBehavior", pkg["ItemNavigationBehavior"]);
	pkg["MovePlacement"] = {
		"On": "On",
		"Before": "Before",
		"After": "After",
	};
	DataType.registerEnum("@ui5/webcomponents-base.MovePlacement", pkg["MovePlacement"]);
	pkg["NavigationMode"] = {
		"Auto": "Auto",
		"Vertical": "Vertical",
		"Horizontal": "Horizontal",
		"Paging": "Paging",
	};
	DataType.registerEnum("@ui5/webcomponents-base.NavigationMode", pkg["NavigationMode"]);
	pkg["ValueState"] = {
		"None": "None",
		"Positive": "Positive",
		"Critical": "Critical",
		"Negative": "Negative",
		"Information": "Information",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ValueState", pkg["ValueState"]);

	return pkg;

}));
