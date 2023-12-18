module.exports = function ({ log } = {}) {
	let c_id = 0,
		c_l = 0;
	return {
		name: "logger",
		resolveId(importee, importer) {
			log?.verbose(`${c_id++} Bundling resource ${importee} from ${importer?.split("/").pop()}`);
			return undefined;
		},
		load(importee) {
			log?.verbose(`	${c_l++} Loading resource ${importee}`);
			return undefined;
		},
	};
};
