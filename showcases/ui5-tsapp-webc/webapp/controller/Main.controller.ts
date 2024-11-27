/* eslint-disable */
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import OverflowToolbar from "sap/m/OverflowToolbar";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";
import Popup from "sap/ui/core/Popup";
import Event from "sap/ui/base/Event";

import Button from "@ui5/webcomponents/Button";
import DatePicker from "@ui5/webcomponents/DatePicker";
import Input from "@ui5/webcomponents/Input";
import { AvatarSize } from "@ui5/webcomponents";
import Token from "@ui5/webcomponents/Token";

// import icons
import "@ui5/webcomponents-icons/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/accept.js";

console.log(AvatarSize);

function injectStyle() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
.panelSpacing {
	margin: 10px;
}
.buttonSpacing {
	margin: 2px;
}
.popover-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
`);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * @namespace ui5.ecosystem.demo.webctsapp.controller
 */
export default class Main extends Controller {
	public onInit(): void {
		injectStyle();

		const button = new Button({ text: "👻", click: this.onBoo });
		if (button instanceof Control) {
			(this.getView()?.byId("contentArea") as VBox).addItem(button);
		}
		const datePicker = new DatePicker({ placeholder: "📅" });
		if (datePicker instanceof Control) {
			(this.getView()?.byId("contentArea") as VBox).addItem(datePicker);
		}
		const input = new Input({ value: "🚀🚀🚀" });
		if (input instanceof Control) {
			(this.getView()?.byId("contentArea") as VBox).addItem(input);
		}
	}

	public onNavToDynamicPage(): void {
		this.getOwnerComponent().getRouter().navTo("DynamicPage");
	}

	public onNavToForm(): void {
		this.getOwnerComponent().getRouter().navTo("FormPage");
	}

	public onNavToValueState(): void {
		this.getOwnerComponent().getRouter().navTo("ValueState");
	}

	public onBoo(): void {
		MessageToast.show(`👻`);
	}

	public onLiveChange(e: Event): void {
		MessageToast.show(`🛠️ liveChange: ${e.getParameter("selectedOption").getText()}`, { at: Popup.Dock.CenterCenter });
	}

	/**
	 * Deletes a token from the MultiInput's "token" aggregation.
	 */
	public deleteToken(e: Event): void {
		const deletedTokens: Token[] = e.getParameter("tokens");
		deletedTokens.forEach((t: Token) => {
			const multiInput = t.getParent();
			multiInput.removeToken(t);
		});
	}

	// wire popover opener buttons
	public onPopoverOpener1Click(e: Event): void {
		const poppy1 = this.byId("popover1");
		poppy1?.setOpen(!poppy1?.getOpen());
	}
	public onPopoverOpener2Click(e: Event): void {
		const poppy2 = this.byId("popover2");
		poppy2?.setOpen(!poppy2?.getOpen());
	}

	/**
	 * Toggles the 'enabled' state of the OverflowToolbar to test the
	 * propagation of the 'enabled' state to child controls.
	 */
	public toggleOverflowToolbarEnabled(e: Event): void {
		const ovt: OverflowToolbar = this.byId("overflowToolbar") as OverflowToolbar;
		ovt.setEnabled(!ovt.getEnabled());
	}
}
