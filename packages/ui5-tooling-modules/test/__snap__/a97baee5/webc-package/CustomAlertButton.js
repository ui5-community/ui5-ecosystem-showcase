/*!
 * ${copyright}
 */
sap.ui.define(
  ["sap/ui/core/webc/WebComponent", "../CustomAlertButton"],
  function (WebComponentBaseClass) {
    "use strict";

    const WrapperClass = WebComponentBaseClass.extend(
      "webc-package.CustomAlertButton",
      {
        metadata: {
          namespace: "webc-package",
          qualifiedNamespace: "webc-package",
          tag: "custom-alert-button",
          interfaces: [],
          properties: {
            text: {
              type: "string",
              mapping: "property",
              defaultValue: "Show Alert"
            },
            message: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            width: {
              type: "sap.ui.core.CSSSize",
              mapping: "style"
            },
            height: {
              type: "sap.ui.core.CSSSize",
              mapping: "style"
            }
          },
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: ["render"],
          designtime: "webc-package/designtime/CustomAlertButton.designtime"
        }
      }
    );

    return WrapperClass;
  }
);
