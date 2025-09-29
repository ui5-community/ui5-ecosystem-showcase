/*!
 * ${copyright}
 */

import WebCButton from "@ui5/webcomponents/dist/Button";
import { MetadataOptions } from "sap/ui/core/webc/WebComponent";

/**
 * Constructor for a new <code>ui5.ecosystem.demo.webctsapp.control.Button</code> control.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Geomap class wrapper for Button.
 * @extends @ui5.webcomponents.dist.Button
 *
 * @author SAP SE
 * @version ${version}
 *
 * @constructor
 * @private
 * @alias sap.ui.geomap.Geomap
 *
 * @namespace ui5.ecosystem.demo.webctsapp.control
 */
export default class Button extends WebCButton {
	static readonly metadata: MetadataOptions = {
		tag: Button.getMetadata().getTag(),
	};
}
