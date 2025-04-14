/*!
 * ${copyright}
 */
sap.ui.define([
	"ui5/ecosystem/demo/app/resources/webcomponents-base",
  "sap/ui/core/webc/WebComponent",
  "sap/ui/base/DataType",
], function(
	WebCPackage,
  WebComponent,
  DataType,
) {
  "use strict";
  const { registerEnum } = DataType;

  const pkg = {
    "_ui5metadata":
{
  "name": "@ui5/webcomponents-base",
  "version": "2.8.0",
  "dependencies": [
    "sap.ui.core"
  ],
  "types": [
    "@ui5/webcomponents-base.AnimationMode",
    "@ui5/webcomponents-base.CalendarType",
    "@ui5/webcomponents-base.ItemNavigationBehavior",
    "@ui5/webcomponents-base.MovePlacement",
    "@ui5/webcomponents-base.NavigationMode",
    "@ui5/webcomponents-base.SortOrder",
    "@ui5/webcomponents-base.ValueState"
  ],
  "interfaces": [],
  "controls": [],
  "elements": [],
  "rootPath": "ui5/ecosystem/demo/app/resources/"
}
  };

	if (WebCPackage) {
		Object.keys(WebCPackage).forEach((key) => {
			if (key !== "default") {
				pkg[key] = WebCPackage[key];
			} else {
				if (typeof WebCPackage[key] === "object") {
					Object.assign(pkg, WebCPackage[key]);
				}
			}
		});
	}

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
  pkg["SortOrder"] = {
    "None": "None",
    "Ascending": "Ascending",
    "Descending": "Descending",
  };
  registerEnum("@ui5/webcomponents-base.SortOrder", pkg["SortOrder"]);
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

	// ====================
	// MONKEY PATCHES END
	// ====================

	return pkg;
});
