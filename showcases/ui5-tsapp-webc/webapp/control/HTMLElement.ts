import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import type { MetadataOptions } from "sap/ui/core/Element";
import CustomData from "sap/ui/core/CustomData";

/**
 * @namespace ui5.ecosystem.demo.webctsapp.control
 */
export default class HTMLElement extends Control {
	static readonly metadata: MetadataOptions = {
		properties: {
			text: "string",
			tag: "string",
		},
		aggregations: {
			children: { type: "sap.ui.core.Control", multiple: true },
		},
		defaultAggregation: "children",
	};

	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(idOrSettings?: string | $HTMLElementSettings);
	constructor(id?: string, settings?: $HTMLElementSettings);
	constructor(id?: string, settings?: $HTMLElementSettings) {
		super(id, settings);
	}

	static renderer = {
		apiVersion: 2,
		render: (rm: RenderManager, control: HTMLElement) => {
			rm.openStart(control.getTag(), control);

			Object.keys(control.getMetadata().getProperties()).forEach((name) => {
				if (name != "tag") {
					const value = control.getProperty(name) as string;
					if (value) {
						rm.attr(name, value);
					}
				}
			});

			control.getCustomData().forEach((cdata: CustomData) => {
				const key = cdata.getKey();
				const value: string = cdata.getValue() as string;
				if (value) {
					rm.attr(key, value);
				}
			});

			rm.openEnd();

			control.getChildren().forEach((child) => {
				rm.renderControl(child);
			});

			rm.close("div");
		},
	};
}
