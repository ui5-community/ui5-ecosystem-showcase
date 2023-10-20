/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
import Controller from "sap/ui/core/mvc/Controller";
import MessageBox from "sap/m/MessageBox";
import { version, utils, write } from "xlsx";
import { Info } from "luxon";
import { Client } from "@stomp/stompjs";
import capitalize from "ui5/ecosystem/demo/tslib/util/capitalize";

function limitString(string = "", limit = 40) {
	return string.substring(0, limit);
}

console.log(`[STATIC IMPORT] XLSX loaded: ${version}`);
// eslint-disable-next-line @typescript-eslint/no-base-to-string
console.log(`[STATIC IMPORT] Luxon loaded: ${limitString(Info.toString())}`);
console.log(`[STATIC IMPORT] STOMP loaded: ${limitString(Client.toString())}`);

// dynamic import of xlsx (just named exports)
import("xlsx")
	.then(({ version }) => {
		console.log(`[DYNAMIC IMPORT] XLSX loaded: ${version}`);
	})
	.catch((ex) => {
		console.log("[DYNAMIC IMPORT] Failed to load XLSX from application runtime environment!", ex);
	});

// dynamic import of an existing library (default and named exports)
import("luxon")
	.then(({ Info }) => {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		console.log(`[DYNAMIC IMPORT] Luxon loaded: ${limitString(Info.toString())}`);
	})
	.catch((ex) => {
		console.log("[DYNAMIC IMPORT] Failed to load Luxon from application runtime environment!", ex);
	});

// dynamic import of an existing library (just default export)
import("@stomp/stompjs")
	.then(({ Client }) => {
		console.log(`[DYNAMIC IMPORT] STOMP loaded: ${limitString(Client.toString())}`);
	})
	.catch((ex) => {
		console.log("[DYNAMIC IMPORT] Failed to load STOMP from application runtime environment!", ex);
	});

// dynamic import of a provided library (will fail without UI5 tooling server!)
import("moment")
	.then(({ version }) => {
		console.log(`[DYNAMIC IMPORT] Moment.js loaded: ${version}`);
	})
	.catch((ex) => {
		console.log("[DYNAMIC IMPORT] Failed to load Moment.js from application runtime environment!", ex);
	});

/**
 * @namespace ui5.ecosystem.demo.tsapp.controller
 */
export default class Main extends Controller {
	public sayHello(): void {
		// using regular imports
		const text: string = capitalize("ui5");
		MessageBox.show(`Hello World, ${text}!`);
	}

	public async sayHelloAsync(): Promise<void> {
		// using dynamic imports for static objects
		const MessageBoxAsync = (await import("sap/m/MessageBox")).default;
		MessageBoxAsync.show(`Hello World!`);
	}

	public downloadXLSX(): void {
		// using regular import for 3rd party
		const book = utils.book_new();
		const sheet = utils.json_to_sheet([
			{
				FirstName: "Jorge",
				LastName: "Martins",
			},
			{
				FirstName: "Peter",
				LastName: "Muessig",
			},
		]);
		utils.book_append_sheet(book, sheet);

		const data = write(book, { type: "base64" }) as string;

		const link = document.createElement("a");
		link.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data;
		link.download = "speakers.xlsx";
		link.click();
	}

	public async downloadPDF(): Promise<void> {
		// using dynamic import for 3rd party
		const { jsPDF } = await import("jspdf");
		const doc = new jsPDF();

		doc.text("Hello World!", 10, 10);
		doc.save("document.pdf");
	}

	public async createMail(): Promise<void> {
		// dynamic import of library
		const { URLHelper } = await import("sap/m/library");
		URLHelper.triggerEmail("any@email.domain");
	}
}
