/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library ui5.ecosystem.demo.cascaded.consumer.
 *
 * This library uses:
 *   - @ui5/webcomponents-fiori/dist/Search  (a different package than the producer)
 *   - @ui5/webcomponents/dist/Input         (SAME package as the producer's Button,
 *                                            but a module the producer did NOT bundle)
 *
 * With "cascadedBuild: true" and the producer library as a dependency:
 *   - The @ui5/webcomponents PACKAGE (registration chunk) is owned by the producer,
 *     so it is NOT re-bundled here; it is referenced at the producer's path.
 *   - @ui5/webcomponents/dist/Input is not in the producer's manifest, so it IS
 *     bundled locally by this consumer (module-level, not package-level, sharing).
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library", "@ui5/webcomponents-fiori/dist/Search", "@ui5/webcomponents/dist/Input"], function (Core) {
	"use strict";

	/**
	 * The <code>ui5.ecosystem.demo.cascaded.consumer</code> library.
	 *
	 * @namespace
	 * @name ui5.ecosystem.demo.cascaded.consumer
	 * @author Peter Muessig
	 * @version ${version}
	 * @public
	 */
	const thisLib = Core.initLibrary({
		name: "ui5.ecosystem.demo.cascaded.consumer",
		version: "${version}",
		dependencies: [
			// keep in sync with the ui5.yaml and .library files
			"sap.ui.core",
			"ui5.ecosystem.demo.cascaded.producer",
		],
		types: [],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true,
	});

	return thisLib;
});
