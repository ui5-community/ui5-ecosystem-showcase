/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library ui5.ecosystem.demo.lib.
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library"], function (Core) {
	"use strict";

	/**
	 * Some description about <code>ui5.ecosystem.demo.lib</code>
	 *
	 * @namespace
	 * @name ui5.ecosystem.demo.lib
	 * @author Peter Muessig
	 * @version ${version}
	 * @public
	 */
	const thisLib = Core.initLibrary({
		name: "ui5.ecosystem.demo.lib",
		version: "${version}",
		dependencies: [
			// keep in sync with the ui5.yaml and .library files
			"sap.ui.core",
		],
		types: ["ui5.ecosystem.demo.lib.ExampleColor"],
		interfaces: [],
		controls: ["ui5.ecosystem.demo.lib.Example"],
		elements: [],
		noLibraryCSS: false, // if no CSS is provided, you can disable the library.css load here
	});

	/**
	 * Semantic Colors of the <code>ui5.ecosystem.demo.lib.Example</code>.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.ExampleColor = {
		/**
		 * Default color (brand color)
		 * @public
		 */
		Default: "Default",

		/**
		 * Highlight color
		 * @public
		 */
		Highlight: "Highlight",
	};

	return thisLib;
});
