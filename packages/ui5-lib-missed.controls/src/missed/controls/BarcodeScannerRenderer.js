/*!
 * ${copyright}
 */

// Provides default renderer for missed.controls.BarcodeScanner
sap.ui.define([], () => {
	"use strict";

	const BarcodeScannerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {missed.controls.BarcodeScanner} oBarcodeScanner an object representation of the control that should be rendered
	 */
	BarcodeScannerRenderer.render = (oRm, oBarcodeScanner) => {
        oRm.openStart("div", oBarcodeScanner);
        oRm.class("missedControlsBarcodeScanner");
		oRm.openEnd();
		oRm.text(oBarcodeScanner.getText())
		oRm.close("div");
	};

	return BarcodeScannerRenderer;
});
