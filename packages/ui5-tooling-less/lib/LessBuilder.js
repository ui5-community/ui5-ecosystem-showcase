const less = require("less-openui5");

module.exports = class LessBuilder {
	constructor(fs) {
		this._builder = new less.Builder({ fs });
	}

	static async create(reader) {
		const { default: fsInterface } = await import("@ui5/fs/fsInterface");
		return new LessBuilder(fsInterface(reader));
	}

	async build(resource) {
		const resourcePath = resource.getPath();
		const output = await this._builder.build({
			lessInputPath: resourcePath,
		});
		output._originalPath = resourcePath;
		output._path = resourcePath.replace(/(.*).less/, "$1.css");
		return output;
	}
};
