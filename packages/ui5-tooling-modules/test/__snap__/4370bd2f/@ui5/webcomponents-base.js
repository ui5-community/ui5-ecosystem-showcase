sap.ui.define(['sap/base/strings/hyphenate', 'sap/ui/core/webc/WebComponent', 'sap/ui/base/DataType'], (function (hyphenate, WebComponent, DataType) { 'use strict';

	// this file contains all imports which are shared between the Monkey Patch files


	// Fixed with https://github.com/SAP/openui5/commit/a4b5fe00b49e0e26e5fd845607a2b95db870d55a in UI5 1.133.0

	WebComponent.prototype.__attachCustomEventsListeners = function() {
		// ##### MODIFICATION START #####
		var oEvents = this.getMetadata().getAllEvents();
		// ##### MODIFICATION END #####
		for (var sEventName in oEvents) {
			var sCustomEventName = hyphenate(sEventName);
			this.getDomRef().addEventListener(sCustomEventName, this.__handleCustomEventBound);
		}
	};

	WebComponent.prototype.__detachCustomEventsListeners = function() {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}

		// ##### MODIFICATION START #####
		var oEvents = this.getMetadata().getAllEvents();
		// ##### MODIFICATION END #####
		for (var sEventName in oEvents) {
			if (oEvents.hasOwnProperty(sEventName)) {
				var sCustomEventName = hyphenate(sEventName);
				oDomRef.removeEventListener(sCustomEventName, this.__handleCustomEventBound);
			}
		}
	};

	// Fixed with https://github.com/SAP/openui5/commit/111c4bcd1660f90714ed567fa8cb57fbc448591f in UI5 1.133.0

	WebComponent.prototype._mapValueState ??= function(sValueState) {
		console.warn("ValueState mapping is not implemented for Web Components yet. Please use UI5 version 1.133.0 or higher.");
		return sValueState;
	};

	const pkg = {
		"_ui5metadata": {
	  "name": "@ui5/webcomponents-base",
	  "version": "2.7.0",
	  "dependencies": [
	    "sap.ui.core"
	  ],
	  "types": [
	    "@ui5/webcomponents-base.AnimationMode",
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
