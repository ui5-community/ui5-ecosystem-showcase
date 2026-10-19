sap.ui.define(['exports'], (function (exports) { 'use strict';

	class CustomAlertButton extends HTMLElement {
		static get observedAttributes() {
			return ["text", "message"];
		}

		attributeChangedCallback() {
			this.render();
		}

		constructor() {
			super();

			/**
			 * Sets the button's text.
			 * @default "Show Alert"
			 * @public
			 */
			this.text = "Show Alert";

			/**
			 * Sets the alert message.
			 * @default ""
			 * @public
			 */
			this.message = "";

			this.attachShadow({ mode: "open" });
			this.render();
		}

		render() {
			const text = this.getAttribute("text") || this.text;
			const message = this.getAttribute("message") || this.message;
			let button;
			if (!this.shadowRoot.querySelector("button")) {
				button = document.createElement("button");
				this.shadowRoot.appendChild(button);
			} else {
				button = this.shadowRoot.querySelector("button");
				button.textContent = text;
				if (message) {
					button.addEventListener("click", async () => {
						alert(message);
					});
				}
			}
		}
	}

	customElements.define("custom-alert-button", CustomAlertButton);

	exports.CustomAlertButton = CustomAlertButton;

}));
