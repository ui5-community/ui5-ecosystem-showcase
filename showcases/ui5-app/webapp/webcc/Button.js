sap.ui.define(["sap/ui/core/webc/WebComponent", "@ui5/webcomponents/dist/Button"], function (WebComponent) {
	return WebComponent.extend("ui5.ecosystem.demo.app.webcc.Button", {
		metadata: {
			tag: "ui5-button",
			properties: {
				text: {
					type: "string",
					mapping: "textContent",
				},
			},
			events: {
				click: {},
			},
		},
	});
});
