// regular code of the Thirdparty.controller.js
sap.ui.define(
	[
		"ui5/ecosystem/demo/app/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/thirdparty/jquery",
		"xlsx",
		"cmis",
		"@supabase/supabase-js",
		"@octokit/core", // requires node-fetch@2 and is-plain-object@5
		"axios",
		"@js-temporal/polyfill",
		"@stomp/stompjs",
		"react",
		"react-dom/client",
		"zod",
		"pdfmake/build/pdfmake",
		"pdfmake/build/vfs_fonts",
		"xml-js",
		"firebase/app", // requires node-fetch@2
		"firebase/firestore/lite",
		"signalr",
	],
	(Controller, MessageToast, jQuery, xlsx, cmis, supabase, octokit, axios, temporal, stompjs, react, reactdom, zod, pdfMake, pdfFonts, xmljs, firebase, firestore, signalr) => {
		"use strict";

		console.log(xlsx);
		console.log(cmis);
		console.log(supabase);
		console.log(octokit);
		console.log(axios);
		console.log(temporal);
		console.log(stompjs);
		console.log(react);
		console.log(reactdom);
		console.log(zod);
		console.log(xmljs);

		pdfMake.vfs = pdfFonts.pdfMake.vfs;
		console.log(pdfMake);

		console.log(firebase);
		console.log(firestore);
		const { initializeApp } = firebase;
		const { getFirestore } = firestore;
		const app = initializeApp({});
		try {
			getFirestore(app);
		} catch (ex) {
			console.error(ex);
		}

		console.log(signalr, jQuery.connection.hub);

		return Controller.extend("ui5.ecosystem.demo.app.controller.Thirdparty", {
			onInit() {
				// https://www.npmjs.com/package/xlsx
				const worksheet = xlsx.utils.aoa_to_sheet([
					["A1", "B1", "C1"],
					["A2", "B2", "C2"],
					["A3", "B3", "C3"],
				]);
				const csv = xlsx.utils.sheet_to_csv(worksheet);
				console.log(worksheet, csv);
			},
			onBoo() {
				// next line should be removed!
				console.log(`👻`);
				MessageToast.show(`👻`);
			},
			onChange(event) {
				this.byId("webcBtn").setText(event.getSource().getValue());
			},
		});
	}
);
