/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/core/webc/WebComponent",
  "sap/ui/core/EnabledPropagator",
  "ui5/ecosystem/demo/app/resources/@ui5/webcomponents",
  "ui5/ecosystem/demo/app/resources/CheckBox",
], function(
  WebComponentBaseClass,
  EnabledPropagator,
) {
  "use strict";


  const WrapperClass = WebComponentBaseClass.extend("ui5.ecosystem.demo.app.any.@ui5.webcomponents.dist.CheckBox", {
    metadata:
{
  "namespace": "@ui5/webcomponents",
  "qualifiedNamespace": "ui5.ecosystem.demo.app.any.@ui5.webcomponents",
  "tag": "ui5-checkbox",
  "interfaces": [
    "sap.ui.core.IFormContent"
  ],
  "properties": {
    "accessibleName": {
      "type": "string",
      "mapping": "property"
    },
    "enabled": {
      "type": "boolean",
      "defaultValue": "true",
      "mapping": {
        "type": "property",
        "to": "disabled",
        "formatter": "_mapEnabled"
      }
    },
    "readonly": {
      "type": "boolean",
      "mapping": "property",
      "defaultValue": false
    },
    "displayOnly": {
      "type": "boolean",
      "mapping": "property",
      "defaultValue": false
    },
    "required": {
      "type": "boolean",
      "mapping": "property",
      "defaultValue": false
    },
    "indeterminate": {
      "type": "boolean",
      "mapping": "property",
      "defaultValue": false
    },
    "checked": {
      "type": "boolean",
      "mapping": "property",
      "defaultValue": false
    },
    "text": {
      "type": "string",
      "mapping": "property"
    },
    "valueState": {
      "type": "ui5.ecosystem.demo.app.any.@ui5.webcomponents-base.ValueState",
      "mapping": "property",
      "defaultValue": "None"
    },
    "wrappingType": {
      "type": "ui5.ecosystem.demo.app.any.@ui5.webcomponents.WrappingType",
      "mapping": "property",
      "defaultValue": "Normal"
    },
    "name": {
      "type": "string",
      "mapping": "property"
    },
    "width": {
      "type": "sap.ui.core.CSSSize",
      "mapping": "style"
    },
    "height": {
      "type": "sap.ui.core.CSSSize",
      "mapping": "style"
    }
  },
  "aggregations": {},
  "associations": {
    "ariaLabelledBy": {
      "type": "sap.ui.core.Control",
      "multiple": true,
      "mapping": {
        "type": "property",
        "to": "accessibleNameRef",
        "formatter": "_getAriaLabelledByForRendering"
      }
    }
  },
  "events": {
    "change": {
      "parameters": {}
    }
  },
  "getters": [],
  "methods": [],
  "library": "@ui5/webcomponents.library",
  "designtime": "@ui5/webcomponents/designtime/CheckBox.designtime"
}
  });

  EnabledPropagator.call(WrapperClass.prototype);

  return WrapperClass;

});
