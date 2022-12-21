sap.ui.define(["test/Sample/controller/BaseController", "xlsx", "ui5-app/bundledefs/firebase" /*, "@supabase/supabase-js"*/], (Controller, xlsx, _firebase, supabase) => {
	"use strict";

	const { initializeApp, getFirestore } = _firebase;
	const app = initializeApp({});
	try {
		getFirestore(app);
	} catch (ex) {
		console.error(ex);
	}

	console.log(supabase);

	return Controller.extend("test.Sample.controller.Thirdparty", {
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
	});
});
