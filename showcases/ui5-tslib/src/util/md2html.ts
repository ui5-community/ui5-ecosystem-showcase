/*!
 * ${copyright}
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion */

import { Converter } from "showdown";

const converter: Converter = new Converter();

export default function (mdString: string): string {
	return converter.makeHtml(mdString) as string;
}
