/*!
 * ${copyright}
 */
sap.ui.define(
  ["../webc-package/CustomAlertButton", "../SubCustomAlertButton"],
  function (CustomAlertButton) {
    "use strict";

    const SubCustomAlertButton = CustomAlertButton.extend(
      "webc-package.SubCustomAlertButton",
      {
        metadata: {
          namespace: "webc-package",
          qualifiedNamespace: "webc-package",
          tag: "sub-custom-alert-button",
          interfaces: [],
          properties: {
            submessage: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            }
          },
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: [],
          designtime: "webc-package/designtime/SubCustomAlertButton.designtime"
        }
      }
    );

    return SubCustomAlertButton;
  }
);
