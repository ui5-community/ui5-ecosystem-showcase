import { CustomAlertButton } from "./CustomAlertButton.js";

export class SubCustomAlertButton extends CustomAlertButton {
	static get observedAttributes() {
		return ["submessage"];
	}

	attributeChangedCallback() {
		this.render();
	}

	constructor() {
		super();

		/**
		 * Sets the alert sub message.
		 * @default ""
		 * @public
		 */
		this.submessage = "";

		this.attachShadow({ mode: "open" });
		this.render();
	}

	render() {
		super.render();

		const submessage = this.getAttribute("submessage") || this.submessage;
		let button = this.shadowRoot.querySelector("button");
		if (submessage) {
			button.addEventListener("click", async () => {
				alert(submessage);
			});
		}
	}
}

customElements.define("sub-custom-alert-button", SubCustomAlertButton);
