/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'./BarcodeScannerRenderer'
], (library, Control, BarcodeScannerRenderer) => {
	// const { MyEnum } = library;

    /**
     * Constructor for a new BarcodeScanner.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The <code>missed.controls.BarcodeScanner</code> control provides a barcode scanner.
     * @extends sap.ui.core.Control
     *
     * @author OpenUI5 community
     * @version ${version}
     *
     * @constructor
     * @public
     * @alias missed.controls.BarcodeScanner
     */
	var BarcodeScanner = Control.extend("missed.controls.BarcodeScanner", /** @lends missed.controls.BarcodeScanner.prototype */ {
		metadata : {
			library : "missed.controls", // can be omitted when control is in same namespace as library
			properties : {
				/**
				 * The text to display.
				 */
				text : {type : "string", group : "Misc", defaultValue : null}
			}
		},
		renderer: BarcodeScannerRenderer
	});

	return BarcodeScanner;

});
