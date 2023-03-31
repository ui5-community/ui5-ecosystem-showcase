sap.ui.define(["sap/ui/core/Element"], function (Element) {
	return Element.extend("ui5-module.ChartRecord", {
		metadata: {
			properties: {
				label: "string",
				value: "float",
			},
		},
	});
});
