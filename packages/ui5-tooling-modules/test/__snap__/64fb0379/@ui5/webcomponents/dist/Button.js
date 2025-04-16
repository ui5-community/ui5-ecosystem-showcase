/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/core/webc/WebComponent",
  "sap/ui/core/EnabledPropagator",
  "ui5/ecosystem/demo/app/resources/@ui5/webcomponents",
  "ui5/ecosystem/demo/app/resources/Button",
], function(
  WebComponentBaseClass,
  EnabledPropagator,
) {
  "use strict";

/**
 * @class
 * ### Overview

The `ui5-button` component represents a simple push button.
It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
certain keyboard keys, such as Enter.

### Usage

For the `ui5-button` UI, you can define text, icon, or both. You can also specify
whether the text or the icon is displayed first.

You can choose from a set of predefined types that offer different
styling to correspond to the triggered action.

You can set the `ui5-button` as enabled or disabled. An enabled
`ui5-button` can be pressed by clicking or tapping it. The button changes
its style to provide visual feedback to the user that it is pressed or hovered over with
the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.

### ES6 Module Import

`import "@ui5/webcomponents/dist/Button.js";`
 * @extends sap.ui.core.webc.WebComponent
 * @constructor
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.dist.Button
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents/dist/Button
 */
  const WrapperClass = WebComponentBaseClass.extend("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Button", {
    metadata:
{
  "tag": "ui5-button",

  "namespace": "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents",

  "designtime": "ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents/designtime/Button.designtime",

  "interfaces": ["ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IButton"],

  "defaultAggregation": "",

  "properties": {
/**
 * Defines the component design.
 */
    "design": {"type":"ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonDesign","mapping":"property","defaultValue":"Default"},
/**
 * Defines whether the component is disabled.
A disabled component can't be pressed or
focused, and it is not in the tab chain.
 */
    "enabled": {"type":"boolean","defaultValue":"true","mapping":{"type":"property","to":"disabled","formatter":"_mapEnabled"}},
/**
 * Defines the icon, displayed as graphical element within the component.
The SAP-icons font provides numerous options.

Example:
See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
 */
    "icon": {"type":"string","mapping":"property"},
/**
 * Defines the icon, displayed as graphical element within the component after the button text.

**Note:** It is highly recommended to use `endIcon` property only together with `icon` and/or `text` properties.
Usage of `endIcon` only should be avoided.

The SAP-icons font provides numerous options.

Example:
See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
 */
    "endIcon": {"type":"string","mapping":"property"},
/**
 * When set to `true`, the component will
automatically submit the nearest HTML form element on `press`.

**Note:** This property is only applicable within the context of an HTML Form element.`
 */
    "submits": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Defines the tooltip of the component.

**Note:** A tooltip attribute should be provided for icon-only buttons, in order to represent their exact meaning/function.
 */
    "tooltip": {"type":"string","mapping":"property"},
/**
 * Defines the accessible ARIA name of the component.
 */
    "accessibleName": {"type":"string","mapping":"property"},
/**
 * Defines the additional accessibility attributes that will be applied to the component.
The following fields are supported:

- **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
Accepts the following string values: `true` or `false`

- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.

- **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
Accepts a lowercase string value.
 */
    "accessibilityAttributes": {"type":"object","mapping":"property","defaultValue":{}},
/**
 * Defines the accessible description of the component.
 */
    "accessibleDescription": {"type":"string","mapping":"property"},
/**
 * Defines whether the button has special form-related functionality.

**Note:** This property is only applicable within the context of an HTML Form element.
 */
    "type": {"type":"ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonType","mapping":"property","defaultValue":"Button"},
/**
 * Describes the accessibility role of the button.

**Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended.
 */
    "accessibleRole": {"type":"ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonAccessibleRole","mapping":"property","defaultValue":"Button"},
/**
 * The text-content of the Web Component.
 */
    "text": {"type":"string","mapping":"textContent"},
/**
 * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
 */
    "width": {"type":"sap.ui.core.CSSSize","mapping":"style"},
/**
 * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
 */
    "height": {"type":"sap.ui.core.CSSSize","mapping":"style"},
  },

  "aggregations": {
/**
 * Adds a badge to the button.
 */
    "badge": {"type":"sap.ui.core.Control","multiple":true,"slot":"badge"},
  },

  "associations": {
/**
 * Receives id(or many ids) of the elements that label the component.
 */
    "ariaLabelledBy": {"type":"sap.ui.core.Control","multiple":true,"mapping":{"type":"property","to":"accessibleNameRef","formatter":"_getAriaLabelledByForRendering"}},
  },

  "events": {
/**
 * Fired when the component is activated either with a
mouse/tap or by using the Enter or Space key.

**Note:** The event will not be fired if the `disabled`
property is set to `true`.
 */
"click": {
    "parameters": {
    }
},
  },

  "getters": [
  ],

  "methods": [
  ]
}
  });

  EnabledPropagator.call(WrapperClass.prototype);

  return WrapperClass;

});
