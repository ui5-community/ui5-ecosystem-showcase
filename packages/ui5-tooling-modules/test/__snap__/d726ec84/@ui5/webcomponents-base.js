/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/core/webc/WebComponent",
  "sap/ui/base/DataType",
], function(
  WebComponent,
  DataType,
) {
  "use strict";
  const { registerEnum } = DataType;

  const pkg = {
    "_ui5metadata":
{
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
  "elements": [],
  "rootPath": "ui5/ecosystem/demo/app/resources/"
}
  };

  pkg["AnimationMode"] = {
    "Full": "Full",
    "Basic": "Basic",
    "Minimal": "Minimal",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents-base.AnimationMode", pkg["AnimationMode"]);
  pkg["CalendarType"] = {
    "Gregorian": "Gregorian",
    "Islamic": "Islamic",
    "Japanese": "Japanese",
    "Buddhist": "Buddhist",
    "Persian": "Persian",
  };
  registerEnum("@ui5/webcomponents-base.CalendarType", pkg["CalendarType"]);
  pkg["ItemNavigationBehavior"] = {
    "Static": "Static",
    "Cyclic": "Cyclic",
  };
  registerEnum("@ui5/webcomponents-base.ItemNavigationBehavior", pkg["ItemNavigationBehavior"]);
  pkg["MovePlacement"] = {
    "On": "On",
    "Before": "Before",
    "After": "After",
  };
  registerEnum("@ui5/webcomponents-base.MovePlacement", pkg["MovePlacement"]);
  pkg["NavigationMode"] = {
    "Auto": "Auto",
    "Vertical": "Vertical",
    "Horizontal": "Horizontal",
    "Paging": "Paging",
  };
  registerEnum("@ui5/webcomponents-base.NavigationMode", pkg["NavigationMode"]);
  pkg["ValueState"] = {
    "None": "None",
    "Positive": "Positive",
    "Critical": "Critical",
    "Negative": "Negative",
    "Information": "Information",
  };
  registerEnum("@ui5/webcomponents-base.ValueState", pkg["ValueState"]);

	// ====================
	// MONKEY PATCHES BEGIN
	// ====================
// Helper to fix a conversion between "number" and "core.CSSSize".
// WebC attribute is a number and is written back to the Control
// wrapper via sap.ui.core.webc.WebComponent base class.
// The control property is defined as a "sap.ui.core.CSSSize".

if (!WebComponent.__setProperty__isPatched) {
	const fnOriginalSetProperty = WebComponent.prototype.setProperty;
	WebComponent.prototype.setProperty = function(sPropName, v, bSupressInvalidate) {
		if ((sPropName === "width" || sPropName === "height") && !isNaN(v)) {
			v += "px";
		}
		return fnOriginalSetProperty.apply(this, [sPropName, v, bSupressInvalidate]);
	};
	WebComponent.__setProperty__isPatched = true;
}

// Fixed with https://github.com/SAP/openui5/commit/a4b5fe00b49e0e26e5fd845607a2b95db870d55a in UI5 1.133.0

if (!WebComponent.__CustomEventsListeners__isPatched) {
	WebComponent.prototype.__attachCustomEventsListeners = function() {
		// ##### MODIFICATION START #####
		var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
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
		var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
		var oEvents = this.getMetadata().getAllEvents();
		// ##### MODIFICATION END #####
		for (var sEventName in oEvents) {
			if (oEvents.hasOwnProperty(sEventName)) {
				var sCustomEventName = hyphenate(sEventName);
				oDomRef.removeEventListener(sCustomEventName, this.__handleCustomEventBound);
			}
		}
	};
	WebComponent.__CustomEventsListeners__isPatched = true;
}

// Fixed with https://github.com/SAP/openui5/commit/111c4bcd1660f90714ed567fa8cb57fbc448591f in UI5 1.133.0

if (!WebComponent.___mapValueState__isPatched) {
	WebComponent.prototype._mapValueState ??= function(sValueState) {
		console.warn("ValueState mapping is not implemented for Web Components yet. Please use UI5 version 1.133.0 or higher.");
		return sValueState;
	};
	WebComponent.___mapValueState__isPatched = true;
}

	// ====================
	// MONKEY PATCHES END
	// ====================

  return pkg;
});
