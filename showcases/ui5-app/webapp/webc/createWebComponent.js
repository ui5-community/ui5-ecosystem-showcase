sap.ui.define(["sap/ui/core/webc/WebComponent", "sap/base/strings/camelize"], function (WebComponent, camelize) {
	"use strict";

	return function createWebComponent(WebComponentClass, { namespace }) {
		const metadata = {
			tag: WebComponentClass.metadata.tag,
			properties: {},
			aggregations: {},
			events: {},
		};

		Object.keys(WebComponentClass.metadata.properties || {}).forEach((propName) => {
			const prop = WebComponentClass.metadata.properties[propName];
			metadata.properties[propName] = {
				type: prop?.type?.name ? prop.type.name.toLowerCase() : "string",
				mapping: "property",
				defaultValue: prop.defaultValue,
			};
		});

		if (WebComponentClass.metadata.slots) {
			Object.keys(WebComponentClass.metadata.slots).forEach((slotName) => {
				const slot = WebComponentClass.metadata.slots[slotName];
				if (slot.propertyName === "text") {
					metadata.properties["text"] = {
						type: "string",
						mapping: "textContent",
					};
				} else {
					const aggregationName = slot.propertyName || slotName;
					if (slotName === "default") {
						metadata.defaultAggregation = slot.propertyName;
						slotName = undefined;
					} else {
						slotName = aggregationName;
					}
					metadata.aggregations[aggregationName] = {
						type: "sap.ui.core.Control",
						multiple: true,
						slot: slotName,
					};
				}
			});
		}

		if (!metadata.properties["text"]) {
			metadata.properties["text"] = {
				type: "string",
				mapping: "textContent",
			};
		}

		if (!metadata.defaultAggregation) {
			metadata.aggregations["default"] = {
				type: "sap.ui.core.Control",
				multiple: true,
			};
			metadata.defaultAggregation = "default";
		}

		if (!metadata.properties["width"]) {
			metadata.properties["width"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
		}

		if (!metadata.properties["height"]) {
			metadata.properties["height"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
		}

		Object.keys(WebComponentClass.metadata.events || {}).forEach((eventName) => {
			metadata.events[camelize(eventName)] = {};
		});

		// TODO: proxy methods => metadata

		return WebComponent.extend(`${namespace ? namespace + "." : ""}${WebComponentClass.name}`, {
			metadata,
		});
	};
});
