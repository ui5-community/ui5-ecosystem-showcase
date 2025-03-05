/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/core/webc/WebComponent",
  "ui5/ecosystem/demo/app/resources/@ui5/webcomponents",
  "ui5/ecosystem/demo/app/resources/Panel",
], function(
  WebComponentBaseClass,
) {
  "use strict";

/**
 * @class
 * ### Overview

The `ui5-panel` component is a container which has a header and a
content area and is used
for grouping and displaying information. It can be collapsed to save space on the screen.

### Guidelines:

- Nesting two or more panels is not recommended.
- Do not stack too many panels on one page.

### Structure
The panel's header area consists of a title bar with a header text or custom header.

The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.

The custom header can be set through the `header` slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.

The content area can contain an arbitrary set of controls.

**Note:** The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.

### Responsive Behavior

- If the width of the panel is set to 100% (default), the panel and its children are
resized responsively,
depending on its parent container.
- If the panel has a fixed height, it will take up the space even if the panel is
collapsed.
- When the panel is expandable (the `fixed` property is set to `false`),
an arrow icon (pointing to the right) appears in front of the header.
- When the animation is activated, expand/collapse uses a smooth animation to open or
close the content area.
- When the panel expands/collapses, the arrow icon rotates 90 degrees
clockwise/counter-clockwise.

### Keyboard Handling

#### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

### ES6 Module Import

`import "@ui5/webcomponents/dist/Panel.js";`
 * @extends sap.ui.core.webc.WebComponent
 * @constructor
 * @public
 * @alias @ui5.webcomponents.Panel
 */
  const WrapperClass = WebComponentBaseClass.extend("@ui5/webcomponents.Panel", {
    metadata:
{
  "tag": "ui5-panel-mYsCoPeSuFfIx",

  "namespace": "@ui5/webcomponents",

  "designtime": "@ui5/webcomponents/designtime/Panel.designtime",

  "interfaces": [],

  "defaultAggregation": "content",

  "properties": {
/**
 * This property is used to set the header text of the component.
The text is visible in both expanded and collapsed states.

**Note:** This property is overridden by the `header` slot.
 */
    "headerText": {"type":"string","mapping":"property"},
/**
 * Determines whether the component is in a fixed state that is not
expandable/collapsible by user interaction.
 */
    "fixed": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Indicates whether the component is collapsed and only the header is displayed.
 */
    "collapsed": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
 */
    "noAnimation": {"type":"boolean","mapping":"property","defaultValue":false},
/**
 * Sets the accessible ARIA role of the component.
Depending on the usage, you can change the role from the default `Form`
to `Region` or `Complementary`.
 */
    "accessibleRole": {"type":"@ui5/webcomponents.PanelAccessibleRole","mapping":"property","defaultValue":"Form"},
/**
 * Defines the "aria-level" of component heading,
set by the `headerText`.
 */
    "headerLevel": {"type":"@ui5/webcomponents.TitleLevel","mapping":"property","defaultValue":"H2"},
/**
 * Defines the accessible ARIA name of the component.
 */
    "accessibleName": {"type":"string","mapping":"property"},
/**
 * Indicates whether the Panel header is sticky or not.
If stickyHeader is set to true, then whenever you scroll the content or
the application, the header of the panel will be always visible and
a solid color will be used for its design.
 */
    "stickyHeader": {"type":"boolean","mapping":"property","defaultValue":false},
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
 * Defines the content of the component. The content is visible only when the component is expanded.
 */
    "content": {"type":"sap.ui.core.Control","multiple":true},
/**
 * Defines the component header area.

**Note:** When a header is provided, the `headerText` property is ignored.
 */
    "header": {"type":"sap.ui.core.Control","multiple":true,"slot":"header"},
  },

  "associations": {
  },

  "events": {
/**
 * Fired when the component is expanded/collapsed by user interaction.
 */
"toggle": {
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


  return WrapperClass;

});
