/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library
 */
sap.ui.define([
	'sap/ui/core/library' // library dependency
], () => {

	/**
	 * The Missed Controls library.
	 *
	 * @namespace
	 * @name missed.controls
	 * @author OpenUI5 Community
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	// note the full api reference notation due to the Core not being booted yet!
	return sap.ui.getCore().initLibrary({
		name : "missed.controls",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [
			"missed.controls.BarcodeScanner"
		],
		elements: [],
		noLibraryCSS: true // if no CSS is provided, you can disable the library.css load here
	});
});
