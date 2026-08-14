/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library ui5.ecosystem.demo.cascaded.producer.
 *
 * This library bundles the @ui5/webcomponents Button. When built with the
 * ui5-tooling-modules task and "cascadedBuild: true", the bundled modules and
 * the @ui5/webcomponents package (incl. its registration chunk) are written to
 * ".ui5-tooling-modules/externals-manifest.json" so that dependent libraries
 * can reference them instead of re-bundling them.
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library", "@ui5/webcomponents/dist/Button"], function (Core) {
	"use strict";

	/**
	 * The <code>ui5.ecosystem.demo.cascaded.producer</code> library.
	 *
	 * @namespace
	 * @name ui5.ecosystem.demo.cascaded.producer
	 * @author Peter Muessig
	 * @version ${version}
	 * @public
	 */
	const thisLib = Core.initLibrary({
		name: "ui5.ecosystem.demo.cascaded.producer",
		version: "${version}",
		dependencies: [
			// keep in sync with the ui5.yaml and .library files
			"sap.ui.core",
		],
		types: [],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true,
	});

	return thisLib;
});
