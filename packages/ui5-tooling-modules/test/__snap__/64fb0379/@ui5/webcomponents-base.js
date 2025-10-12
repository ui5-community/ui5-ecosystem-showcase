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

    const pkg = {
      _ui5metadata: {
        name: "@ui5/webcomponents-base",
        version: "2.12.0",
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

    // Fixed with https://github.com/UI5/openui5/commit/090a19eb317785fc047b9b3d2c59016cacc3e8fa in UI5 1.140.0

    if (!WebComponent.__MappingSupportForEvents__isPatched) {
      var WebComponentMetadataPrototype = Object.getPrototypeOf(
        WebComponent.getMetadata()
      );
      var OriginalEvent = WebComponentMetadataPrototype.metaFactoryEvent;
      var WebComponentEvent = function (oClass, name, info) {
        OriginalEvent.apply(this, arguments);
        if (info.mapping) {
          this._sMapTo =
            typeof info.mapping !== "object" ? info.mapping : info.mapping.to;
        }
        this._isCustomEvent = true; // WebComponent events are always custom events
      };
      WebComponentEvent.prototype = Object.create(OriginalEvent.prototype);
      WebComponentEvent.prototype.constructor = WebComponentEvent;
      WebComponentMetadataPrototype.metaFactoryEvent = WebComponentEvent;

      WebComponentMetadataPrototype.getEventsForCustomEvent = function (
        sCustomEventName
      ) {
        var mFiltered = {};
        var mEvents = this.getAllEvents();
        for (var sEventName in mEvents) {
          var oEventObj = mEvents[sEventName];
          if (oEventObj._isCustomEvent) {
            if (
              sEventName === sCustomEventName ||
              oEventObj._sMapTo === sCustomEventName
            ) {
              mFiltered[sEventName] = oEventObj;
            }
          }
        }

        return mFiltered;
      };

      WebComponent.prototype.__attachCustomEventsListeners = function () {
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oDomRef = this.getDomRef();
        var oEvents = this.getMetadata().getAllEvents();
        for (var sEventName in oEvents) {
          if (oEvents[sEventName]._isCustomEvent) {
            var sCustomEventName = hyphenate(
              oEvents[sEventName]._sMapTo || sEventName
            );
            this.__handleCustomEventBound =
              this.__handleCustomEventBound ||
              this.__handleCustomEvent.bind(this);
            oDomRef.addEventListener(
              sCustomEventName,
              this.__handleCustomEventBound
            );
          }
        }
      };

      WebComponent.prototype.__detachCustomEventsListeners = function () {
        var oDomRef = this.getDomRef();
        if (!oDomRef) {
          return;
        }
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oEvents = this.getMetadata().getAllEvents();
        for (var sEventName in oEvents) {
          if (oEvents[sEventName]._isCustomEvent) {
            var sCustomEventName = hyphenate(
              oEvents[sEventName]._sMapTo || sEventName
            );
            oDomRef.removeEventListener(
              sCustomEventName,
              this.__handleCustomEventBound
            );
          }
        }
      };

      WebComponent.prototype.__handleCustomEvent = function (oEvent) {
        // Prepare the event data object
        var camelize = sap.ui.require("sap/base/strings/camelize");
        var sEventName = camelize(oEvent.type);
        var oEventData = this.__formatEventData(oEvent.detail);

        // Notify all custom events that are registered for this event name
        var mCustomEvents =
          this.getMetadata().getEventsForCustomEvent(sEventName);
        for (var sName in mCustomEvents) {
          var oEventObj = mCustomEvents[sName];
          var bPrevented = !oEventObj.fire(this, oEventData);
          if (bPrevented) {
            oEvent.preventDefault();
          }
        }
      };

      WebComponent.__MappingSupportForEvents__isPatched = true;
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

    return pkg;
  }
);
