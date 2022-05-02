module.exports = createPageObjects({
	Other: {
		arrangements: {},
		actions: {
			iNavigateBack: () => {
				element(
					by.control({
						viewName: "test.Sample.view.Other",
						id: /.*navButton$/,
					})
				).click();
			},
		},
		assertions: {
			iShouldSeeTheList: () => {
				const list = element(
					by.control({
						viewName: "test.Sample.view.Other",
						id: "PeopleList",
					})
				);

				expect(list.asControl().getProperty("visible")).toBe(true);
			},
		},
	},
});
