module.exports = function (api) {
	api.cache(true);

	const presets = ["transform-ui5", "@babel/preset-typescript", "@babel/preset-env"];
	const plugins = [
		[
			"transform-async-to-promises",
			{
				inlineHelpers: true
			}
		]
	];

	return {
		presets,
		plugins
	};
};
