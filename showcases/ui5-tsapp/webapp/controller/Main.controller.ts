/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
import Controller from "sap/ui/core/mvc/Controller";
import MessageBox from "sap/m/MessageBox";
import { utils, write } from "xlsx";
import capitalize from "ui5/ecosystem/demo/tslib/util/capitalize";

// dynamic import of a provided library
import("luxon")
	.then(({ Info }) => {
		console.log(`Luxon loaded: ${Info.toString()}`);
	})
	.catch((ex) => {
		console.log("Failed to load luxon from application runtime environment!", ex);
	});

// dynamic import of an existing library
import("@stomp/stompjs")
	.then(({ Client }) => {
		console.log(`STOMP.js loaded: ${Client.toString()}`);
	})
	.catch((ex) => {
		console.log("Failed to load STOMP.js from application runtime environment!", ex);
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

		doc.text("Hello world!", 10, 10);
		doc.save("a4.pdf");
	}

	public async createMail(): Promise<void> {
		// dynamic import of library
		const { URLHelper } = await import("sap/m/library");
		URLHelper.triggerEmail("any@email.domain");
	}
}
