/*!
 * ${copyright}
 */

// Provides control ui5.ecosystem.demo.tslib.Example.
import Control from "sap/ui/core/Control";
import ExampleRenderer from "./ExampleRenderer";
import { ExampleColor } from "./library";

/**
 * An additional export to test the re-export of interfaces in d.ts
 *
 * @export
 * @enum {String}
 */
export type DummyType = {
	someProperty: string;
};
// fixture: a non-exported type to verify the d.ts post-processing in
// ui5-tooling-transpile only restores `export` on previously-exported decls
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LocalType = {
	someProperty: string;
};

/**
 * An additional export to test the re-export of enums in d.ts
 *
 * @export
 * @enum {String}
 */
export enum DummyEnum {
	Value1 = "Value1",
	Value2 = "Value2",
}
// fixture: a non-exported enum (see LocalType note above)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum LocalEnum {
	Value1 = "Value1",
	Value2 = "Value2",
}

/**
 * An additional export to test the re-export of interfaces in d.ts
 *
 * @export
 * @enum {String}
 */
export interface DummyInterface {
	someProperty: string;
}
// fixture: a non-exported interface (see LocalType note above)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LocalInterface {
	someProperty: string;
}

/**
 * Constructor for a new <code>ui5.ecosystem.demo.tslib.Example</code> control.
 *
 * Some class description goes here.
 * @extends Control
 *
 * @author OpenUI5 Team
 * @version ${version}
 *
 * @constructor
 * @public
 * @name ui5.ecosystem.demo.tslib.Example
 */
export default class Example extends Control {
	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(id?: string | $ExampleSettings);
	constructor(id?: string, settings?: $ExampleSettings);
	constructor(id?: string, settings?: $ExampleSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "ui5.ecosystem.demo.tslib",
		properties: {
			/**
			 * The text to display.
			 */
			text: {
				type: "string",
				group: "Data",
				defaultValue: null,
			},
			/**
			 * The color to use (default to "Default" color).
			 */
			color: {
				type: "ui5.ecosystem.demo.tslib.ExampleColor",
				group: "Appearance",
				defaultValue: ExampleColor.Default,
			},
		},
		events: {
			/**
			 * Event is fired when the user clicks the control.
			 */
			press: {},
		},
	};

	static renderer: typeof ExampleRenderer = ExampleRenderer;

	onclick = () => {
		this.firePress();
	};
}
