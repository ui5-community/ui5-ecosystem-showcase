/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
import MessageBox from "sap/m/MessageBox";
import Controller from "sap/ui/core/mvc/Controller";
import { utils, write } from "xlsx";

/**
 * @namespace ui5.ecosystem.demo.tsapp.controller
 */
export default class Main extends Controller {
	public sayHello(): void {
		MessageBox.show("Hello World!");
	}

	public downloadXLSX(): void {
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
}
