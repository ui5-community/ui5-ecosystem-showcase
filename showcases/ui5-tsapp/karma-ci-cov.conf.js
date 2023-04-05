module.exports = function (config) {
	require("./karma-ci.conf")(config);
	config.set({
		reporters: ["progress", "coverage"],
		preprocessors: {
			"webapp/**/*.ts": ["ui5-transpile", "coverage"],
			"webapp/**/*.js": ["coverage"],
		},
		coverageReporter: {
			dir: "coverage",
			reporters: [
				{ type: "html", subdir: "report-html" },
				{ type: "cobertura", subdir: ".", file: "cobertura.txt" },
				{ type: "lcovonly", subdir: ".", file: "report-lcovonly.txt" },
				{ type: "text-summary" },
			],
		},
	});
};
