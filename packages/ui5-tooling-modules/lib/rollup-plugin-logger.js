module.exports = function ({ log } = {}) {
	return {
		name: "logger",
		resolveId(source) {
			log?.verbose(`Bundling resource ${source}`);
			return undefined;
		},
	};
};
