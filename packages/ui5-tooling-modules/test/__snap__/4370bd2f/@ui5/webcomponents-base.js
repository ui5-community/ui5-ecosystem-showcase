/*!
 * ${copyright}
 */
sap.ui.define([
  "../webcomponents-base",
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
    "@ui5.webcomponents-base.AnimationMode",
    "@ui5.webcomponents-base.CalendarType",
    "@ui5.webcomponents-base.ItemNavigationBehavior",
    "@ui5.webcomponents-base.MovePlacement",
    "@ui5.webcomponents-base.NavigationMode",
    "@ui5.webcomponents-base.SortOrder",
    "@ui5.webcomponents-base.ValueState"
  ],
  "interfaces": [],
  "controls": [],
  "elements": [],
  "rootPath": "../"
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

  /**
 * Different types of AnimationMode.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.AnimationMode
 * @ui5-module-override @ui5/webcomponents-base AnimationMode
 */

  pkg["AnimationMode"] = {
    /**
 * 
 * @public
 */
    "Full": "Full",
    /**
 * 
 * @public
 */
    "Basic": "Basic",
    /**
 * 
 * @public
 */
    "Minimal": "Minimal",
    /**
 * 
 * @public
 */
    "None": "None",
  };
  registerEnum("@ui5.webcomponents-base.AnimationMode", pkg["AnimationMode"]);
  /**
 * Different calendar types.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.CalendarType
 * @ui5-module-override @ui5/webcomponents-base CalendarType
 */

  pkg["CalendarType"] = {
    /**
 * 
 * @public
 */
    "Gregorian": "Gregorian",
    /**
 * 
 * @public
 */
    "Islamic": "Islamic",
    /**
 * 
 * @public
 */
    "Japanese": "Japanese",
    /**
 * 
 * @public
 */
    "Buddhist": "Buddhist",
    /**
 * 
 * @public
 */
    "Persian": "Persian",
  };
  registerEnum("@ui5.webcomponents-base.CalendarType", pkg["CalendarType"]);
  /**
 * Different behavior for ItemNavigation.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.ItemNavigationBehavior
 * @ui5-module-override @ui5/webcomponents-base ItemNavigationBehavior
 */

  pkg["ItemNavigationBehavior"] = {
    /**
 * Static behavior: navigations stops at the first or last item.
 * @public
 */
    "Static": "Static",
    /**
 * Cycling behavior: navigating past the last item continues with the first and vice versa.
 * @public
 */
    "Cyclic": "Cyclic",
  };
  registerEnum("@ui5.webcomponents-base.ItemNavigationBehavior", pkg["ItemNavigationBehavior"]);
  /**
 * Placements of a moved element relative to a target element.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.MovePlacement
 * @ui5-module-override @ui5/webcomponents-base MovePlacement
 */

  pkg["MovePlacement"] = {
    /**
 * 
 * @public
 */
    "On": "On",
    /**
 * 
 * @public
 */
    "Before": "Before",
    /**
 * 
 * @public
 */
    "After": "After",
  };
  registerEnum("@ui5.webcomponents-base.MovePlacement", pkg["MovePlacement"]);
  /**
 * Different navigation modes for ItemNavigation.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.NavigationMode
 * @ui5-module-override @ui5/webcomponents-base NavigationMode
 */

  pkg["NavigationMode"] = {
    /**
 * 
 * @public
 */
    "Auto": "Auto",
    /**
 * 
 * @public
 */
    "Vertical": "Vertical",
    /**
 * 
 * @public
 */
    "Horizontal": "Horizontal",
    /**
 * 
 * @public
 */
    "Paging": "Paging",
  };
  registerEnum("@ui5.webcomponents-base.NavigationMode", pkg["NavigationMode"]);
  /**
 * Defines the sort order.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.SortOrder
 * @ui5-module-override @ui5/webcomponents-base SortOrder
 */

  pkg["SortOrder"] = {
    /**
 * Sorting is not applied.
 * @public
 */
    "None": "None",
    /**
 * Sorting is applied in ascending order.
 * @public
 */
    "Ascending": "Ascending",
    /**
 * Sorting is applied in descending order.
 * @public
 */
    "Descending": "Descending",
  };
  registerEnum("@ui5.webcomponents-base.SortOrder", pkg["SortOrder"]);
  /**
 * Different types of ValueStates.
 * @enum {string}
 * @public
 * @alias module:@ui5/webcomponents-base.ValueState
 * @ui5-module-override @ui5/webcomponents-base ValueState
 */

  pkg["ValueState"] = {
    /**
 * 
 * @public
 */
    "None": "None",
    /**
 * 
 * @public
 */
    "Positive": "Positive",
    /**
 * 
 * @public
 */
    "Critical": "Critical",
    /**
 * 
 * @public
 */
    "Negative": "Negative",
    /**
 * 
 * @public
 */
    "Information": "Information",
  };
  registerEnum("@ui5.webcomponents-base.ValueState", pkg["ValueState"]);

  // Interfaces

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
