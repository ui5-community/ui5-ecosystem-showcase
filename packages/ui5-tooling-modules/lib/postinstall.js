const path = require("path");
const fs = require("fs");

// only register if the current working directory is set
// and the npm config variable "rte" or "register_tooling_extension" is set
// or the environment variable "ui5eco_rte" or "ui5eco_register_tooling_extension" is set
const cwd = process.env["INIT_CWD"];
const rteValue = process.env["npm_config_rte"] || process.env["npm_config_register_tooling_extension"] || process.env["ui5eco_rte"] || process.env["ui5eco_register_tooling_extension"];

const shouldRegister = cwd && rteValue;

// Function to register UI5 CLI extensions in a YAML file
function registerInYamlFile(yamlFilePath) {
	if (!fs.existsSync(yamlFilePath)) {
		return false;
	}

	// load the YAML parser
	const yaml = require("js-yaml");

	// read the yaml file with all documents
	const doc = yaml.loadAll(fs.readFileSync(yamlFilePath, "utf8"));

	// no documents found => no creation
	if (!doc || doc.length === 0) {
		return false;
	}

	// only write the yaml if it has been changed
	let changed = false;

	// if there are multiple documents, we only take the first one
	const builder = (doc[0].builder ??= {});
	const ct = (builder.customTasks ??= []);
	if (!ct.find((t) => t.name === "ui5-tooling-modules-task")) {
		// push after ui5-tooling-transpile-task
		const index = ct.findIndex((t) => t.name === "ui5-tooling-transpile-task");
		if (index === -1) {
			// or if not found, just add it at the beginning
			ct.unshift({
				name: "ui5-tooling-modules-task",
				afterTask: "replaceVersion",
			});
		} else {
			ct.splice(index + 1, 0, {
				name: "ui5-tooling-modules-task",
				afterTask: "ui5-tooling-transpile-task",
			});
		}
		changed = true;
	}

	// if there are multiple documents, we only take the first one
	const server = (doc[0].server ??= {});
	const cmw = (server.customMiddleware ??= []);
	if (!cmw.find((mw) => mw.name === "ui5-tooling-modules-middleware")) {
		// push after ui5-tooling-transpile-middleware
		const index = cmw.findIndex((mw) => mw.name === "ui5-tooling-transpile-middleware");
		if (index === -1) {
			// or if not found, just add it at the beginning
			cmw.unshift({
				name: "ui5-tooling-modules-middleware",
				afterMiddleware: "compression",
			});
		} else {
			cmw.splice(index + 1, 0, {
				name: "ui5-tooling-modules-middleware",
				afterMiddleware: "ui5-tooling-transpile-middleware",
			});
		}
		changed = true;
	}

	// Write back to YAML file
	if (changed) {
		fs.writeFileSync(yamlFilePath, doc.length > 1 ? yaml.dumpAll(doc) : yaml.dump(doc[0]), "utf8");
		return true;
	}

	return false;
}

// determine which YAML files to register in
let yamlFiles = [];
if (rteValue === "true") {
	// default: only ui5.yaml
	yamlFiles = [path.join(cwd, "ui5.yaml")];
} else if (typeof rteValue === "string" && rteValue !== "true") {
	// custom files specified
	yamlFiles = rteValue
		.split(",")
		.map((filename) => filename.trim())
		.filter((filename) => filename.length > 0)
		.map((filename) => path.join(cwd, filename));
}

// register in specified YAML files
if (shouldRegister) {
	yamlFiles.forEach((yamlFile) => {
		registerInYamlFile(yamlFile);
	});
}

// and the tsconfig.json file exists in the current working directory
if (shouldRegister && fs.existsSync(path.join(cwd, "tsconfig.json"))) {
	// load the JSONC parser
	const JSONC = require("comment-json");

	// read the tsconfig.json file
	const tsconfig = JSONC.parse(fs.readFileSync(path.join(cwd, "tsconfig.json"), "utf8"));

	// no documents found => no creation
	if (tsconfig) {
		// only write the tsconfig.json if it has been changed
		let changed = false;

		// include types
		tsconfig.include ??= [];
		if (!tsconfig.include.includes("./.ui5-tooling-modules/types/**/*")) {
			tsconfig.include.push("./.ui5-tooling-modules/types/**/*");
			changed = true;
		}

		// Write back to JSONC file
		if (changed) {
			fs.writeFileSync(path.join(cwd, "tsconfig.json"), JSONC.stringify(tsconfig, undefined, 2), "utf8");
		}
	}
}
