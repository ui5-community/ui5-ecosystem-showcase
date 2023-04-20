module.exports = function (config) {
	require("./karma.conf")(config);
	config.set({
		browsers: ["ChromeHeadless"],
		singleRun: true,
	});
};
