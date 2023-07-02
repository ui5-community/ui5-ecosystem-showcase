import Controller from "sap/ui/core/mvc/Controller";
import { createTypedJSONModel } from "../model/models";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.controller
 */
export default class Main extends Controller {
	model = createTypedJSONModel({
		notes: [
			{
				id: 0,
				text: "Hello World",
				createdAt: new Date(),
			},
		],
		currentNoteId: 0,

		newNoteInput: "",
	});

	onInit() {
		this.getView()?.setModel(this.model);
	}

	onDelete(id: number) {
		console.log(id);
		let notes = this.model.getProperty("/notes");
		notes = notes.filter((note) => note.id !== id);
		this.model.setProperty("/notes", notes);
	}

	onCreate() {
		const notes = this.model.getProperty("/notes");
		const newNoteId = this.model.getProperty("/currentNoteId") + 1;
		notes.push({
			id: newNoteId,
			text: this.model.getProperty("/newNoteInput"),
			createdAt: new Date(),
		});

		this.model.setProperty("/notes", notes);
		this.model.setProperty("/currentNoteId", newNoteId);
		this.model.setProperty("/newNoteInput", "");
	}
}
