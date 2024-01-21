sap.ui.define(["sap/ui/core/webc/WebComponent", "@ui5/webcomponents/dist/Panel"], function (WebComponent) {
	return WebComponent.extend("ui5.ecosystem.demo.app.webcc.Panel", {
		metadata: {
			tag: "ui5-panel",
			properties: {
				headerText: {
					type: "string",
					mapping: "property",
				},
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
				},
			},
			events: {
				click: {},
			},
		},
	});
});
