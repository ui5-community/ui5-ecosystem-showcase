/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/core/EnabledPropagator",
    "../../../@ui5/webcomponents",
    "../../../CheckBox"
  ],
  function (WebComponentBaseClass, EnabledPropagator) {
    "use strict";

    const WrapperClass = WebComponentBaseClass.extend(
      "@ui5.webcomponents.dist.CheckBox",
      {
        metadata: {
          namespace: "@ui5/webcomponents",
          qualifiedNamespace: "@ui5.webcomponents",
          tag: "ui5-checkbox",
          interfaces: ["sap.ui.core.IFormContent"],
          properties: {
            accessibleName: {
              type: "any",
              mapping: "property"
            },
            checked: {
              type: "any",
              mapping: "property",
              defaultValue: false
            },
            enabled: {
              type: "boolean",
              defaultValue: "true",
              mapping: {
                type: "property",
                to: "disabled",
                formatter: "_mapEnabled"
              }
            },
            displayOnly: {
              type: "any",
              mapping: "property",
              defaultValue: false
            },
            indeterminate: {
              type: "any",
              mapping: "property",
              defaultValue: false
            },
            name: {
              type: "any",
              mapping: "property"
            },
            readonly: {
              type: "any",
              mapping: "property",
              defaultValue: false
            },
            required: {
              type: "any",
              mapping: "property",
              defaultValue: false
            },
            text: {
              type: "any",
              mapping: "property"
            },
            value: {
              type: "any",
              mapping: "property",
              defaultValue: "on"
            },
            valueState: {
              type: "any",
              mapping: {
                formatter: "_mapValueState",
                parser: "_parseValueState"
              },
              defaultValue: "None"
            },
            wrappingType: {
              type: "any",
              mapping: "property",
              defaultValue: "Normal"
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
          associations: {
            ariaLabelledBy: {
              type: "sap.ui.core.Control",
              multiple: true,
              mapping: {
                type: "property",
                to: "accessibleNameRef",
                formatter: "_getAriaLabelledByForRendering"
              }
            }
          },
          events: {
            change: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {}
            }
          },
          getters: [],
          methods: [],
          designtime: "@ui5/webcomponents/designtime/CheckBox.designtime"
        }
      }
    );

    EnabledPropagator.call(WrapperClass.prototype);

    return WrapperClass;
  }
);
