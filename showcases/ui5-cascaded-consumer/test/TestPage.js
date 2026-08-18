sap.ui.define(
	[
		// The Web Components are consumed via their original npm module paths (imperatively,
		// not declaratively via an XMLView):
		//  - Button is bundled by the producer library
		//  - Input  is bundled by the consumer library (same @ui5/webcomponents package as
		//           Button, but a module the producer did not bundle -> owned by the consumer)
		//  - Search is bundled by the consumer library (@ui5/webcomponents-fiori)
		//
		// In `dev` (middleware) these are resolved on the fly; in `start` (build output) they
		// are served from the libraries' generated wrappers via the cascaded build.
		"@ui5/webcomponents/dist/Button",
		"@ui5/webcomponents/dist/Input",
		"@ui5/webcomponents-fiori/dist/Search",
	],
	function (Button, Input, Search) {
		"use strict";

		// imperatively create the Web Component wrapper controls and place them into the DOM
		const input = new Input({
			placeholder: "Type something (from consumer)",
		});
		input.placeAt("content");

		new Button({
			design: "Emphasized",
			text: "Press me (from producer)",
			click: function () {
				// eslint-disable-next-line no-alert
				alert(input.getValue() ? `You typed: ${input.getValue()}` : `Button pressed!`);
			},
		}).placeAt("content");

		new Search({
			placeholder: "Search (from consumer)",
		}).placeAt("content");
	},
);
