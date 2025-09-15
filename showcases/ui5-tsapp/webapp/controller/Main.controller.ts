/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Controller from "sap/ui/core/mvc/Controller";
import MessageBox from "sap/m/MessageBox";
import { version, utils, write } from "xlsx";
import { Info } from "luxon";
import { Client } from "@stomp/stompjs";
import { Chart } from "chart.js";
import capitalize from "ui5/ecosystem/demo/tslib/util/capitalize";
import camelizeSomething from "../utils/camelizeSomething";
import WebComponent from "sap/ui/core/webc/WebComponent";
import LuigiEvents, { LuigiContainer } from "@luigi-project/container";
import _capitalize from "ui5-tsmodule/capitalize";

function limitString(string = "", limit = 40) {
	return string.substring(0, limit);
}

console.log(camelizeSomething());

console.log(`[STATIC IMPORT] XLSX loaded: ${version}`);
// eslint-disable-next-line @typescript-eslint/no-base-to-string
console.log(`[STATIC IMPORT] Luxon loaded: ${limitString(Info.toString())}`);
console.log(`[STATIC IMPORT] STOMP loaded: ${limitString(Client.toString())}`);
console.log(`[STATIC IMPORT] Chart.js loaded: ${Chart.version}`);

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

// dynamic import of a provided library (will fail without UI5 CLI server!)
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
	public onInit(): void {
		// TODO: add and remove event handler
		const oLuigi = this.byId("luigi") as WebComponent;
		console.log(`The LuigiContainer as named export is no Web Component!`, LuigiContainer);
		oLuigi.attachBrowserEvent(LuigiEvents.ALERT_REQUEST, (event: Event) => {
			const detail = (event as CustomEvent).detail as { text: string };
			MessageBox.show(`Hello World, ${detail.text}!`);
		});
	}

	public sayHello(): void {
		// using regular imports
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const text1: string = capitalize("ui5");
		const text2: string = _capitalize("type-script");
		MessageBox.show(`Hello World, ${text1}, ${text2}!`);
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
