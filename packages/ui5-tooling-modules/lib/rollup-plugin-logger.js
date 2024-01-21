module.exports = function ({ log } = {}) {
	let c_r = 0,
		c_l = 0,
		c_t = 0;
	return {
		name: "logger",
		resolveId(importee, importer) {
			log?.verbose(`${c_r++} Bundling resource ${importee} from ${importer?.split("/").pop()}`);
			return undefined;
		},
		load(importee) {
			log?.verbose(`	${c_l++} Loading resource ${importee}`);
			return undefined;
		},
		transform(code, id) {
			log?.verbose(`	${c_t++} Transforming resource ${id}`);
			return undefined;
		},
	};
};
