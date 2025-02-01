import type { MetadataOptions } from "sap/ui/core/Element";
import OtherControl from "./OtherControl";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.control
 */
export default class SimpleControl extends OtherControl {
	static readonly metadata: MetadataOptions = {
		properties: {
			additionalText: "string",
		},
	};

	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(idOrSettings?: string | $SimpleControlSettings);
	constructor(id?: string, settings?: $SimpleControlSettings);
	constructor(id?: string, settings?: $SimpleControlSettings) {
		super(id, settings);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	static renderer = (OtherControl.getMetadata() as any).getRenderer();
}
