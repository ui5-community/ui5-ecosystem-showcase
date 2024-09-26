/* eslint-disable */
import Controller from "sap/ui/core/mvc/Controller";

function injectStyle() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
.panelSpacing {
	margin: 10px;
}
.popover-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.formLayouting {
	max-width: 90%;
	overflow-x: auto;
}
`);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * @namespace ui5.ecosystem.demo.webctsapp.controller
 */
export default class FormPage extends Controller {
	public onInit(): void {
		injectStyle();
	}

	public onNavBack(): void {
		this.getOwnerComponent().getRouter().navTo("Main");
	}
}
