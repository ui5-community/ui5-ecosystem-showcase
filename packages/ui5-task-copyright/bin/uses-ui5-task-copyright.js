#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const ui5YamlPath = process.argv[2] || path.join(process.cwd(), "ui5.yaml");
if (!ui5YamlPath) {
	console.error("\x1b[31m[ERROR]\x1b[0m No ui5.yaml provided!");
	process.exit(1);
}
if (!fs.existsSync(ui5YamlPath) || !fs.statSync(ui5YamlPath).isFile()) {
	console.error(`\x1b[31m[ERROR]\x1b[0m The ${ui5YamlPath} does not exist!`);
	process.exit(1);
}

try {
	const content = fs.readFileSync(ui5YamlPath, "utf-8");
	const ui5Configs = yaml.loadAll(content);
	const notFound = (ui5Configs[0]?.builder?.customTasks || []).findIndex((task) => task.name === "ui5-task-copyright") === -1;
	if (notFound) {
		console.error(`\x1b[31m[ERROR]\x1b[0m ui5-task-copyright is not registered in ${ui5YamlPath}!`);
		process.exit(1);
	}
} catch (err) {
	if (err.name === "YAMLException") {
		console.error(`\x1b[31m[ERROR]\x1b[0m Failed to read ${ui5YamlPath}!`);
		process.exit(1);
	}
	throw err;
}
