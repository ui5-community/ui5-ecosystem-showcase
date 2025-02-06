/*!
 * ${copyright}
 */

// Provides control ui5.ecosystem.demo.tslib.Button.
// TODO: for interface generation, the control must extend a WebComponent base class and
// the WebCButton base class used here is really a UI5 Web Component and no control!
import WebCButton from "@ui5/webcomponents/dist/Button";
//import WebComponent from "sap/ui/core/webc/WebComponent";

/**
 * Constructor for a new <code>ui5.ecosystem.demo.tslib.Button</code> control.
 *
 * Some class description goes here.
 * @extends @ui5.webcomponents.dist.Button
 *
 * @author OpenUI5 Team
 * @version ${version}
 *
 * @constructor
 * @public
 * @name ui5.ecosystem.demo.tslib.Button
 */
export default class Button extends WebCButton {
	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(id?: string | $ButtonSettings);
	constructor(id?: string, settings?: $ButtonSettings);
	constructor(id?: string, settings?: $ButtonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "ui5.ecosystem.demo.tslib",
		tag: WebCButton.getMetadata().getTag(),
		properties: {
			/**
			 * The text to display.
			 */
			specialText: {
				type: "string",
				group: "Data",
				defaultValue: null,
			},
		},
	};
}
