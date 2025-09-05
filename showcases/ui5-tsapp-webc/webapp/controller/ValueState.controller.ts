/* eslint-disable */
import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";

function injectStyle() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
.panelSpacing {
	margin: 10px;
}
`);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * @namespace ui5.ecosystem.demo.webctsapp.controller
 */
export default class ValueState extends Controller {
	public onInit(): void {
		injectStyle();
	}

	public onNavBack(): void {
		(this.getOwnerComponent() as UIComponent).getRouter().navTo("Main");
	}
}
