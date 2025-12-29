/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "../webcomponents-base",
    "sap/ui/core/webc/WebComponent",
    "sap/ui/base/DataType"
  ],
  function (WebCPackage, WebComponent, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "@ui5/webcomponents-base",
      version: "2.17.1",
      dependencies: ["sap.ui.core"],
      types: [
        "@ui5.webcomponents-base.AnimationMode",
        "@ui5.webcomponents-base.CalendarType",
        "@ui5.webcomponents-base.ItemNavigationBehavior",
        "@ui5.webcomponents-base.MovePlacement",
        "@ui5.webcomponents-base.NavigationMode",
        "@ui5.webcomponents-base.SortOrder",
        "@ui5.webcomponents-base.ValueState"
      ],
      interfaces: [],
      controls: [],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of AnimationMode.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.AnimationMode
     * @ui5-module-override @ui5/webcomponents-base AnimationMode
     * @private
     */
    pkg["AnimationMode"] = {
      /**
       * Full
       *
       * @private
       */
      Full: "Full",
      /**
       * Basic
       *
       * @private
       */
      Basic: "Basic",
      /**
       * Minimal
       *
       * @private
       */
      Minimal: "Minimal",
      /**
       * None
       *
       * @private
       */
      None: "None"
    };
    registerEnum("@ui5.webcomponents-base.AnimationMode", pkg["AnimationMode"]);
    /**
     * Different calendar types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.CalendarType
     * @ui5-module-override @ui5/webcomponents-base CalendarType
     * @private
     */
    pkg["CalendarType"] = {
      /**
       * Gregorian
       *
       * @private
       */
      Gregorian: "Gregorian",
      /**
       * Islamic
       *
       * @private
       */
      Islamic: "Islamic",
      /**
       * Japanese
       *
       * @private
       */
      Japanese: "Japanese",
      /**
       * Buddhist
       *
       * @private
       */
      Buddhist: "Buddhist",
      /**
       * Persian
       *
       * @private
       */
      Persian: "Persian"
    };
    registerEnum("@ui5.webcomponents-base.CalendarType", pkg["CalendarType"]);
    /**
     * Different behavior for ItemNavigation.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.ItemNavigationBehavior
     * @ui5-module-override @ui5/webcomponents-base ItemNavigationBehavior
     * @private
     */
    pkg["ItemNavigationBehavior"] = {
      /**
       * Static behavior: navigations stops at the first or last item.
       *
       * @private
       */
      Static: "Static",
      /**
       * Cycling behavior: navigating past the last item continues with the first and vice versa.
       *
       * @private
       */
      Cyclic: "Cyclic"
    };
    registerEnum(
      "@ui5.webcomponents-base.ItemNavigationBehavior",
      pkg["ItemNavigationBehavior"]
    );
    /**
     * Placements of a moved element relative to a target element.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.MovePlacement
     * @ui5-module-override @ui5/webcomponents-base MovePlacement
     * @private
     */
    pkg["MovePlacement"] = {
      /**
       * On
       *
       * @private
       */
      On: "On",
      /**
       * Before
       *
       * @private
       */
      Before: "Before",
      /**
       * After
       *
       * @private
       */
      After: "After"
    };
    registerEnum("@ui5.webcomponents-base.MovePlacement", pkg["MovePlacement"]);
    /**
     * Different navigation modes for ItemNavigation.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.NavigationMode
     * @ui5-module-override @ui5/webcomponents-base NavigationMode
     * @private
     */
    pkg["NavigationMode"] = {
      /**
       * Auto
       *
       * @private
       */
      Auto: "Auto",
      /**
       * Vertical
       *
       * @private
       */
      Vertical: "Vertical",
      /**
       * Horizontal
       *
       * @private
       */
      Horizontal: "Horizontal",
      /**
       * Paging
       *
       * @private
       */
      Paging: "Paging"
    };
    registerEnum(
      "@ui5.webcomponents-base.NavigationMode",
      pkg["NavigationMode"]
    );
    /**
     * Defines the sort order.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.SortOrder
     * @ui5-module-override @ui5/webcomponents-base SortOrder
     * @private
     */
    pkg["SortOrder"] = {
      /**
       * Sorting is not applied.
       *
       * @private
       */
      None: "None",
      /**
       * Sorting is applied in ascending order.
       *
       * @private
       */
      Ascending: "Ascending",
      /**
       * Sorting is applied in descending order.
       *
       * @private
       */
      Descending: "Descending"
    };
    registerEnum("@ui5.webcomponents-base.SortOrder", pkg["SortOrder"]);
    /**
     * Different types of ValueStates.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents-base.ValueState
     * @ui5-module-override @ui5/webcomponents-base ValueState
     * @private
     */
    pkg["ValueState"] = {
      /**
       * None
       *
       * @private
       */
      None: "None",
      /**
       * Positive
       *
       * @private
       */
      Positive: "Positive",
      /**
       * Critical
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Negative
       *
       * @private
       */
      Negative: "Negative",
      /**
       * Information
       *
       * @private
       */
      Information: "Information"
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
      WebComponent.prototype.setProperty = function (
        sPropName,
        v,
        bSupressInvalidate
      ) {
        if ((sPropName === "width" || sPropName === "height") && !isNaN(v)) {
          const sType = this.getMetadata()
            .getProperty(sPropName)
            .getType()
            .getName();
          if (sType === "sap.ui.core.CSSSize") {
            v += "px";
          }
        }
        return fnOriginalSetProperty.apply(this, [
          sPropName,
          v,
          bSupressInvalidate
        ]);
      };
      WebComponent.__setProperty__isPatched = true;
    }

    // Helper to forward the CustomData to the root dom ref in the shadow dom.

    if (!WebComponent.__CustomData__isPatched) {
      const fnOriginalOnAfterRendering =
        WebComponent.prototype.onAfterRendering;
      WebComponent.prototype.onAfterRendering = function () {
        const aCustomData = this.getCustomData();
        if (aCustomData?.length > 0) {
          setTimeout(
            function () {
              const oDomRef = this.getDomRef();
              // either use the getFocusDomRef method or the getDomRef method to get the shadow DOM reference
              const oShadowDomRef =
                oDomRef &&
                ((typeof oDomRef.getFocusDomRef === "function" &&
                  oDomRef.getFocusDomRef()) ||
                  (typeof oDomRef.getDomRef === "function" &&
                    oDomRef.getDomRef()) ||
                  (oDomRef.shadowRoot && oDomRef.shadowRoot.firstElementChild)); // for all non UI5Elements
              if (oShadowDomRef) {
                aCustomData.forEach(function (oCustomData) {
                  if (oCustomData.getWriteToDom()) {
                    const sKey = oCustomData.getKey();
                    const sValue = oCustomData.getValue();
                    oShadowDomRef.setAttribute(`data-${sKey}`, sValue);
                  }
                });
              }
            }.bind(this),
            0
          );
        }
        return fnOriginalOnAfterRendering.apply(this, arguments);
      };
      WebComponent.__CustomData__isPatched = true;
    }

    // ====================
    // MONKEY PATCHES END
    // ====================

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
