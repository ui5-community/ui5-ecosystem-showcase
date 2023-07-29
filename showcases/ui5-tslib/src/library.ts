/*!
 * ${copyright}
 */

import ObjectPath from "sap/base/util/ObjectPath";

/**
 * Initialization Code and shared classes of library ui5.ecosystem.demo.tslib.
 */

// delegate further initialization of this library to the Core
// Hint: sap.ui.getCore() must still be used here to support preload with sync bootstrap!
sap.ui.getCore().initLibrary({
	name: "ui5.ecosystem.demo.tslib",
	version: "${version}",
	dependencies: [
		// keep in sync with the ui5.yaml and .library files
		"sap.ui.core",
	],
	types: ["ui5.ecosystem.demo.tslib.ExampleColor"],
	interfaces: [],
	controls: ["ui5.ecosystem.demo.tslib.Example"],
	elements: [],
	noLibraryCSS: false, // if no CSS is provided, you can disable the library.css load here
});

// get the library object from global object space because all enums must be attached to it to be usable as UI5 types
// FIXME: this line is planned to become obsolete and may need to be removed later
const thisLib: { [key: string]: unknown } = ObjectPath.get("ui5.ecosystem.demo.tslib") as { [key: string]: unknown };

/**
 * Semantic Colors of the com.myorg.myUI5Library.Example control.
 *
 * @enum {string}
 * @public
 */
export enum ExampleColor {
	/**
	 * Default color (brand color)
	 * @public
	 */
	Default = "Default",

	/**
	 * Highlight color
	 * @public
	 */
	Highlight = "Highlight",
}
// FIXME: this line is planned to become obsolete and may need to be removed later
thisLib.ExampleColor = ExampleColor; // add the enum to the library; this is important because UI5 otherwise cannot identify the type and will skip type checking for properties of this type
