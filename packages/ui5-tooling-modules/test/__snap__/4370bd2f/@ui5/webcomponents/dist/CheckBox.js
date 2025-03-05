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

/**
 * @class
 * ### Overview

Allows the user to set a binary value, such as true/false or yes/no for an item.

The `ui5-checkbox` component consists of a box and a label that describes its purpose.
If it's checked, an indicator is displayed inside the box.
To check/uncheck the `ui5-checkbox`, the user has to click or tap the square
box or its label.

The `ui5-checkbox` component only has 2 states - checked and unchecked.
Clicking or tapping toggles the `ui5-checkbox` between checked and unchecked state.

### Usage

You can define the checkbox text with via the `text` property. If the text exceeds the available width, it is truncated by default.
In case you prefer text to truncate, set the `wrappingType` property to "None".
The touchable area for toggling the `ui5-checkbox` ends where the text ends.

You can disable the `ui5-checkbox` by setting the `disabled` property to
`true`,
or use the `ui5-checkbox` in read-only mode by setting the `readonly`
property to `true`.

### Keyboard Handling

The user can use the following keyboard shortcuts to toggle the checked state of the `ui5-checkbox`.

- [Space],[Enter] - Toggles between different states: checked, not checked.

### ES6 Module Import

`import "@ui5/webcomponents/dist/CheckBox.js";`
 * @extends sap.ui.core.webc.WebComponent
 * @constructor
 * @public
 * @alias @ui5.webcomponents.CheckBox
 */
  const WrapperClass = WebComponentBaseClass.extend("@ui5/webcomponents.CheckBox", {
    metadata:
{
  "tag": "ui5-checkbox",

  "namespace": "@ui5/webcomponents",

  "designtime": "@ui5/webcomponents/designtime/CheckBox.designtime",

  "interfaces": ["sap.ui.core.IFormContent"],

  "defaultAggregation": "",

  "properties": {
/**
 * Defines the accessible ARIA name of the component.
 */
    "accessibleName": {"type":"string","mapping":"property"},
/**
 * Defines whether the component is disabled.

**Note:** A disabled component is completely noninteractive.
 */
    "enabled": {"type":"boolean","defaultValue":"true","mapping":{"type":"property","to":"disabled","formatter":"_mapEnabled"}},
/**
 * Defines whether the component is read-only.

**Note:** A read-only component is not editable,
but still provides visual feedback upon user interaction.
 */
    "readonly": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Determines whether the `ui5-checkbox` is in display only state.

When set to `true`, the `ui5-checkbox` is not interactive, not editable, not focusable
and not in the tab chain. This setting is used for forms in review mode.

**Note:** When the property `disabled` is set to `true` this property has no effect.
 */
    "displayOnly": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Defines whether the component is required.
 */
    "required": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Defines whether the component is displayed as partially checked.

**Note:** The indeterminate state can be set only programmatically and can’t be achieved by user
interaction and the resulting visual state depends on the values of the `indeterminate`
and `checked` properties:

-  If the component is checked and indeterminate, it will be displayed as partially checked
-  If the component is checked and it is not indeterminate, it will be displayed as checked
-  If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute
 */
    "indeterminate": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Defines if the component is checked.

**Note:** The property can be changed with user interaction,
either by cliking/tapping on the component, or by
pressing the Enter or Space key.
 */
    "checked": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Defines the text of the component.
 */
    "text": {"type":"string","mapping":"property"},
/**
 * Defines the value state of the component.
 */
    "valueState": {"type":"@ui5/webcomponents-base.ValueState","mapping":"property","defaultValue":"None"},
/**
 * Defines whether the component text wraps when there is not enough space.

**Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
**Note:** for option "None" the text will be truncated with an ellipsis.
 */
    "wrappingType": {"type":"@ui5/webcomponents.WrappingType","mapping":"property","defaultValue":"Normal"},
/**
 * Determines the name by which the component will be identified upon submission in an HTML form.

**Note:** This property is only applicable within the context of an HTML Form element.
 */
    "name": {"type":"string","mapping":"property"},
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
  },

  "associations": {
/**
 * Receives id(or many ids) of the elements that label the component
 */
    "ariaLabelledBy": {"type":"sap.ui.core.Control","multiple":true,"mapping":{"type":"property","to":"accessibleNameRef","formatter":"_getAriaLabelledByForRendering"}},
  },

  "events": {
/**
 * Fired when the component checked state changes.
 */
"change": {
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
