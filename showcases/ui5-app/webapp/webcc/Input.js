sap.ui.define(["sap/ui/core/webc/WebComponent", "@ui5/webcomponents/dist/Input"], function (WebComponent) {
	return WebComponent.extend("ui5.ecosystem.demo.app.webcc.Input", {
		metadata: {
			tag: "ui5-input",
			properties: {
				value: {
					type: "string",
					mapping: "property",
				},
			},
			events: {
				change: {},
			},
		},
	});
});
