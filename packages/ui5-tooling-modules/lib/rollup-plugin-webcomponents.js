const { join, dirname, extname } = require("path");

// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX = "?webcomponent";

const registry = {};

module.exports = function ({ resolveModule } = {}) {

	const lookupWebComponentsClass = function lookupWebComponentsClass(source) {
		const absModulePath = resolveModule(source);
		if (registry[absModulePath]) {
			return registry[absModulePath];
		}

		// determine npm package
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		const npmPackage = npmPackageScopeRegEx.exec(source)?.[1];

		if (!registry[npmPackage]) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
				if (!registry[npmPackage] && packageJson.customElements) {
					// load custom elements metadata
					const metadataPath = resolveModule(join(npmPackage, packageJson.customElements));
					registry[npmPackage] = require(metadataPath);
					registry[npmPackage].npmPackagePath = dirname(packageJsonPath);
				}
			}
		}

		if (registry[npmPackage]) {
			const metadata = registry[npmPackage];
			const modulePath = absModulePath.substr(metadata.npmPackagePath.length + 1);
			const module = metadata.modules.find(module => module.path === modulePath);


			// a Web Components module only declares one class
			const clazz = module.declarations.find(declaration => declaration.kind === "class");
			/*
			clazz.allAttributes = new Map(clazz.attributes?.map(attr => [attr.name, attr]));
			clazz.allMembers = new Map(clazz.members?.map(member => [member.name, member]));
			clazz.allSlots = new Map(clazz.slots?.map(slot => [slot.name, slot]));
			*/

			if (clazz.superclass) {
				const { package, module } = clazz.superclass;
				const superclazz = lookupWebComponentsClass(`${package}/${module}`);
				if (superclazz) {
					Object.assign(clazz.superclass, superclazz);
					/*
					clazz.allAttributes = new Map([...superclazz.allAttributes, ...clazz.allAttributes]);
					clazz.allMembers = new Map([...superclazz.allMembers, ...clazz.allMembers]);
					clazz.allSlots = new Map([...superclazz.allSlots, ...clazz.allSlots]);
					*/
				}
			}

			registry[absModulePath] = clazz;
			clazz.modulePath = absModulePath;
			clazz.moduleName = `${npmPackage}/${modulePath.substr(0, modulePath.length - extname(modulePath).length)}`;
			return clazz;
		}

	}

	return {
		name: "webcomponents",
		async resolveId(source/*, importer, options*/) {
			if (source === "sap/ui/core/webc/WebComponent") {
				// mark Ui5 runtime dependencies as external
				// to avoid warnings about missing dependencies
				return {
					id: source,
					external: true
				};
			} else {
				// find the Web Components class for the given module
				const clazz = lookupWebComponentsClass(source);
				if (clazz) {
					return `${clazz.modulePath}${SUFFIX}`;
				}
			}
		},
		async load(id) {
			if (id.endsWith(SUFFIX)) {
				const entryId = id.slice(0, -SUFFIX.length);
				const clazz = registry[entryId];
				if (!clazz) {
					return null;
				}

				const clazzTypes = {};

				const fieldToProperty = (field) => {
					if (Array.isArray(field.type?.references)) {
						field.type.references.forEach(reference => {
							const modulePath = resolveModule(`${reference.package}/${reference.module}`);
							clazzTypes[reference.name] = {
								...reference,
								modulePath
							};
						});
						const type = clazzTypes[field.type.text];
						return {
							type,
							mapping: "property"
						};
					}
					return {
						type: field.type?.text.split("|").map(type => type.toLowerCase().trim()).shift() || "string",
						mapping: "property"
					};
				};

				const slotToAggregation = (slot) => {
					return {
						type: "sap.ui.core.Control",
						multiple: true,
						slot: slot.name === "default" ? undefined : slot.name,
					}
				};

				const ui5Metadata = {
					tag: clazz.tagName,
					properties: Object.fromEntries(clazz.members?.filter(member => member.kind === "field").map(field => [field.name, fieldToProperty(field)]) || []),
					aggregations: Object.fromEntries(clazz.slots?.map(slot => [slot.name, slotToAggregation(slot)]) || []),
					events: Object.fromEntries(clazz.events?.map(event => [event.name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase()), event]) || []),
					methods: clazz.members?.filter(member => member.kind === "method").map(method => method.name),
				};

				ui5Metadata.defaultAggregation = ui5Metadata.aggregations.default ? "default" : undefined;

				if (!ui5Metadata.properties["text"]) {
					ui5Metadata.properties["text"] = {
						type: "string",
						mapping: "textContent",
					};
				}

				["height", "width"].forEach(prop => {
					ui5Metadata.properties[prop] = {
						type: "sap.ui.core.CSSSize",
						mapping: "style"
					};
				});

				// Namespace reexports do not reexport default, so we need
				// special handling here
				let code = `import WebComponentClass from ${JSON.stringify(entryId)};\n`;
				// TODO: Identify parent class
				code += `import WebComponentBaseClass from ${JSON.stringify(clazz.superclass?.moduleName || "sap/ui/core/webc/WebComponent")};\n`;
				// Import all required types
				Object.entries(clazzTypes).forEach(([name, type]) => {
					code += `import ${name} from ${JSON.stringify(type.modulePath)};\n`;
				});
				// TODO: WebComponent.extend
				//code += `export default WebComponent.wrap(WebComponentClass);`;
				code += `export default WebComponentBaseClass.extend(${JSON.stringify(clazz.moduleName)}, { metadata: ${JSON.stringify(ui5Metadata, undefined, 2)} });\n`;
				return code;
			}
			return null;
		},
	};
};
