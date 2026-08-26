#!/usr/bin/env node
/**
 * Standalone CLI to generate UI5 control wrappers from a "custom-elements.json"
 * (custom-elements-manifest) file.
 *
 * Usage:
 *   create-webc-controls <custom-elements.json> <outputFolder> [options]
 *
 * Arguments:
 *   <custom-elements.json>  path or file:// URL to the custom elements manifest
 *   <outputFolder>          folder that receives the generated UI5 control files
 *
 * Options:
 *   --namespace <name>          override the package namespace (default: name from nearest package.json)
 *   --version <version>         override the package version (default: version from nearest package.json)
 *   --framework-version <ver>   UI5 framework version used for version-dependent generation (default: 2.0.0)
 *   -h, --help                  show this help
 *
 * It reuses the WebComponentRegistry to process the manifest and the existing
 * handlebars templates (UI5Package.hbs / UI5Control.hbs) to serialize the UI5
 * package glue and one wrapper control per class described by the metadata.
 *
 * In contrast to the rollup plugin this runs without a bundler: it processes a
 * single manifest (no cross-package dependency resolution) and therefore mainly
 * targets native HTML element packages (e.g. "@ui5/html") whose wrappers extend
 * "sap/ui/core/html/HTMLElement" and have no runtime Web Component to import.
 */
const { join, dirname, resolve, posix } = require("path");
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const { fileURLToPath } = require("url");

const { compile } = require("handlebars");
const prettier = require("@prettier/sync");

const WebComponentRegistry = require("../lib/utils/WebComponentRegistry");
const WebComponentRegistryHelper = require("../lib/utils/WebComponentRegistryHelper");
const { UI5_ELEMENT_NAMESPACE } = WebComponentRegistryHelper;

const TEMPLATES_DIR = join(__dirname, "..", "lib", "templates");

// prettier options for the generated sources (kept in sync with the rollup plugin).
// quoteProps "preserve" keeps the quotes that JSON.stringify puts on every metadata key, so
// property names that are reserved words (e.g. HTML's "class") stay quoted instead of being
// unquoted by prettier's default "as-needed".
const PRETTIER_OPTIONS = { semi: true, trailingComma: "none", parser: "babel", quoteProps: "preserve" };

// -------------------------------------------------------------------------
// argument parsing
// -------------------------------------------------------------------------

function printUsage() {
	console.log(
		[
			"Usage: create-webc-controls <custom-elements.json> <outputFolder> [options]",
			"",
			"Arguments:",
			"  <custom-elements.json>  path or file:// URL to the custom elements manifest",
			"  <outputFolder>          folder that receives the generated UI5 control files",
			"",
			"Options:",
			"  --namespace <name>            override the npm package namespace (default: name from nearest package.json)",
			"  --ui5-namespace <ns>          UI5 namespace for the generated artifacts, dot or slash notation (default: the npm namespace)",
			'  --strip-module-prefix <seg>   leading module path segment to strip from the generated names, e.g. "dist"',
			"  --version <version>           override the package version (default: version from nearest package.json)",
			"  --framework-version <ver>     UI5 framework version for version-dependent generation (default: 2.0.0)",
			"  -h, --help                    show this help",
		].join("\n"),
	);
}

function parseArgs(argv) {
	const positional = [];
	const options = { frameworkVersion: "2.0.0" };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		const readValue = (inline) => (inline !== undefined ? inline : argv[++i]);
		if (arg === "-h" || arg === "--help") {
			options.help = true;
		} else if (arg.startsWith("--ui5-namespace")) {
			options.ui5Namespace = readValue(arg.split("=")[1]);
		} else if (arg.startsWith("--strip-module-prefix")) {
			options.stripModulePrefix = readValue(arg.split("=")[1]);
		} else if (arg.startsWith("--namespace")) {
			options.namespace = readValue(arg.split("=")[1]);
		} else if (arg.startsWith("--framework-version")) {
			options.frameworkVersion = readValue(arg.split("=")[1]);
		} else if (arg.startsWith("--version")) {
			options.version = readValue(arg.split("=")[1]);
		} else if (arg.startsWith("--")) {
			throw new Error(`Unknown option: ${arg}`);
		} else {
			positional.push(arg);
		}
	}
	options.input = positional[0];
	options.output = positional[1];
	return options;
}

// convert a path or file:// URL into an absolute filesystem path
function toPath(input) {
	if (input.startsWith("file:")) {
		return fileURLToPath(input);
	}
	return resolve(input);
}

// walk up from the given directory to find the nearest package.json
function findNearestPackageJson(startDir) {
	let dir = startDir;
	for (;;) {
		const candidate = join(dir, "package.json");
		if (existsSync(candidate)) {
			return { path: candidate, json: JSON.parse(readFileSync(candidate, "utf-8")) };
		}
		const parent = dirname(dir);
		if (parent === dir) {
			return undefined;
		}
		dir = parent;
	}
}

// -------------------------------------------------------------------------
// template loading
// -------------------------------------------------------------------------

function loadAndCompileTemplate(templateName) {
	const templateFile = readFileSync(join(TEMPLATES_DIR, templateName), { encoding: "utf-8" });
	return compile(templateFile);
}

// -------------------------------------------------------------------------
// file emission
// -------------------------------------------------------------------------

function writeGeneratedFile(outputDir, moduleName, code) {
	const targetFile = join(outputDir, `${moduleName}.js`);
	mkdirSync(dirname(targetFile), { recursive: true });
	writeFileSync(targetFile, prettier.format(code, PRETTIER_OPTIONS), { encoding: "utf-8" });
	return targetFile;
}

// -------------------------------------------------------------------------
// package (library) generation — mirrors buildPackage() of the rollup plugin
// -------------------------------------------------------------------------

function buildPackage({ package: pkg, template, outputDir }) {
	// the generated library module path and qualified name follow the (remappable) UI5 namespace,
	// not the physical npm package name
	const source = pkg.ui5Namespace;
	const version = pkg.version;
	// absolute UI5 module names (see buildWrapper) -> no relative root navigation needed
	const rootPath = "";

	const metadataObject = {
		name: pkg.qualifiedNamespace,
		version,
		dependencies: ["sap.ui.core"],
		types: Object.keys(pkg.enums).map((enumName) => pkg.enums[enumName]._ui5QualifiedName),
		interfaces: Object.keys(pkg.interfaces).map((interfaceName) => pkg.interfaces[interfaceName]._ui5QualifiedName),
		controls: Object.keys(pkg.customElements).map((elementName) => pkg.customElements[elementName]._ui5QualifiedName),
		elements: [],
		rootPath,
	};
	const metadata = JSON.stringify(metadataObject, undefined, 2);

	const isBaseLib = pkg.namespace === UI5_ELEMENT_NAMESPACE;

	const code = template({
		isBaseLib,
		metadata,
		namespace: pkg.qualifiedNamespace,
		interfaces: pkg.interfaces,
		hasEnums: Object.keys(pkg.enums).length > 0,
		enums: pkg.enums,
		dependencies: pkg.dependencies?.map((dep) => `${rootPath}${dep}`),
		// no bundler chunk and no monkey patches in the standalone scenario:
		// native HTML packages don't ship a runtime Web Component package
		monkeyPatches: "",
		webcPackage: undefined,
	});

	return writeGeneratedFile(outputDir, source, code);
}

// -------------------------------------------------------------------------
// library (library.js) generation — used when libraryMode: true
// -------------------------------------------------------------------------

function buildLibrary({ package: pkg, template, outputDir }) {
	const metadataObject = {
		apiVersion: 2,
		name: pkg.qualifiedNamespace,
		version: pkg.version,
		dependencies: ["sap.ui.core"],
		types: Object.keys(pkg.enums).map((enumName) => pkg.enums[enumName]._ui5QualifiedName),
		interfaces: Object.keys(pkg.interfaces).map((interfaceName) => pkg.interfaces[interfaceName]._ui5QualifiedName),
		controls: Object.keys(pkg.customElements).map((elementName) => pkg.customElements[elementName]._ui5QualifiedName),
		elements: [],
		// generated control wrappers ship no library styling, so tell the UI5 loader not to
		// request a (non-existent) library.css per theme, which would otherwise 404 at runtime
		noLibraryCSS: true,
	};
	const metadata = JSON.stringify(metadataObject, undefined, 2);

	// The library.js places enums into their derived sub-namespace
	// (e.g. thisLib.enums["Wrapping"]) so the JS object path matches the UI5 qualified
	// name "sap.html.enums.Wrapping" and the generated JSDoc (@alias / @ui5-module-override).
	// Important: the package module path (buildPackage -> UI5Package.hbs) intentionally emits
	// them flat (pkg["Wrapping"]) for backward compatibility with released
	// web component consumers. The two implementations therefore drift on purpose for now;
	// This is to be unified in a future major version of ui5-tooling-modules.
	// Additionally, only a single sub-namespace level ("enums") is supported here; deeper
	// paths would need multi-level namespace initialization (out of scope for now).
	const enums = Object.values(pkg.enums).map((enumDef) => {
		const derived = enumDef._derivedUi5ClassName || enumDef.name; // e.g. "enums.Wrapping" | "Wrapping"
		const subNamespace = derived.includes(".") ? derived.slice(0, derived.lastIndexOf(".")) : "";
		const accessor = subNamespace ? `thisLib.${subNamespace}["${enumDef.name}"]` : `thisLib["${enumDef.name}"]`;
		return { ...enumDef, _subNamespace: subNamespace, _libraryAccessor: accessor };
	});
	const enumNamespaces = [...new Set(enums.map((enumDef) => enumDef._subNamespace).filter(Boolean))];

	const code = template({
		metadata,
		hasEnums: enums.length > 0,
		enums,
		enumNamespaces,
		dependencies: pkg.dependencies?.map((dep) => dep),
	});

	// write to <outputDir>/<ui5Namespace>/library.js, e.g. sap/html/library.js
	const moduleName = `${pkg.ui5Namespace}/library`;
	return writeGeneratedFile(outputDir, moduleName, code);
}

// -------------------------------------------------------------------------
// control wrapper generation — mirrors buildWrapper() of the rollup plugin
// -------------------------------------------------------------------------

function serializeMetadata(clazz) {
	const ui5Metadata = clazz._ui5metadata;

	// The createControls (library) path prunes the emitted control metadata to
	// reduce payload, so we omit unused keys.
	// Important: the rollup plugin (package path for released web component consumers) intentionally
	// keeps the full metadata for backward compatibility -> both implementations drift on purpose for
	// now; to be unified in a future major version. Keep the defaultValue handling below in sync.
	const metadataObject = Object.assign({}, ui5Metadata, {
		tag: ui5Metadata.tag,
	});
	delete metadataObject.namespace;
	delete metadataObject.qualifiedNamespace;
	delete metadataObject.designtime;

	// default values are special cased to avoid JSON.stringify() escaping them, which
	// would make them invalid in the generated code. Must stay in sync with the rollup plugin.
	return JSON.stringify(
		metadataObject,
		function (key, value) {
			// omit empty object/array sections to reduce the generated payload
			if (Array.isArray(value)) {
				if (value.length === 0) {
					return undefined;
				}
			} else if (value && typeof value === "object" && Object.keys(value).length === 0) {
				return undefined;
			}
			if (key === "defaultValue") {
				switch (value) {
					case undefined:
					case "undefined":
						return undefined;
					case "":
						return value;
					default:
						try {
							return JSON.parse(value);
						} catch {
							console.warn(`The defaultValue for ${clazz.name} is not a valid JSON string: ${value}. Removing the defaultValue property from the metadata.`);
							return undefined;
						}
				}
			}
			return value;
		},
		2,
	);
}

function buildWrapper({ clazz, template, outputDir, emitted, packageModule }) {
	// emission path + imports follow the (remappable, strip-aware) UI5 qualified name
	const resolvedSource = clazz._ui5QualifiedNameSlashes;
	if (emitted.has(resolvedSource)) {
		return [];
	}
	emitted.add(resolvedSource);

	const written = [];

	const ui5ClassName = clazz._ui5QualifiedName;
	const ui5Superclass = clazz.superclass;

	const metadata = serializeMetadata(clazz);

	// no bundler chunk in the standalone scenario -> no runtime Web Component module to import
	let webcClass = undefined;
	// generated wrappers are plain AMD sources placed in a resource tree, so we import via
	// fully-qualified (absolute) UI5 module names instead of fragile relative "../.." paths
	const rootPath = "";

	// whether the class is a UI5 Web Component (extends UI5Element)
	const isClazzUI5Element = WebComponentRegistryHelper.isSubclassOf(clazz, "@ui5/webcomponents-base", "UI5Element");

	// MessageMixin / LabelEnablement install method wrappers into a shared prototype slot.
	// Applying them twice in the same prototype chain causes infinite recursion, so we only
	// emit them on the topmost ancestor that introduces the flag; subclasses inherit them.
	// EnabledPropagator is intentionally NOT gated (per-wrapper closure, safe to chain).
	const superChainHas = (c, flag) => {
		for (let s = c?.superclass; s?._ui5specifics; s = s.superclass) {
			if (s._ui5specifics[flag]) {
				return true;
			}
		}
		return false;
	};
	const needsLabelEnablement = clazz._ui5specifics.needsLabelEnablement && !superChainHas(clazz, "needsLabelEnablement");
	const needsEnabledPropagator = clazz._ui5specifics.needsEnabledPropagator;
	const needsMessageMixin = clazz._ui5specifics.needsMessageMixin && !superChainHas(clazz, "needsMessageMixin");

	// determine the superclass UI5 module name and import it
	let webcBaseClass = "sap/ui/core/webc/WebComponent";
	if (WebComponentRegistryHelper.isUi5CoreHTMLElement(ui5Superclass)) {
		// native HTML elements extend the core HTMLElement base class
		webcBaseClass = "sap/ui/core/html/HTMLElement";
	} else if (ui5Superclass?._ui5metadata && !WebComponentRegistryHelper.isUI5Element(ui5Superclass)) {
		webcBaseClass = clazz.superclass._ui5QualifiedNameSlashes;
		// ensure the superclass wrapper exists as well
		written.push(...buildWrapper({ clazz: clazz.superclass, template, outputDir, emitted, packageModule }));
	}

	// no runtime class import required for native HTML elements
	if (WebComponentRegistryHelper.isSubclassOf(clazz, "sap.ui.core.html", "HTMLElement")) {
		webcClass = undefined;
	}

	const resolvedWebcBaseClass = webcBaseClass !== "sap/ui/core/webc/WebComponent" ? `${rootPath}${webcBaseClass}` : webcBaseClass;
	const webcBaseClassName = posix.basename(resolvedWebcBaseClass).replace(/\.js$/, "");
	const ui5ClassSimpleName = WebComponentRegistryHelper.deriveClassVariableName(clazz);
	const code = template({
		ui5ClassName,
		ui5ClassSimpleName,
		jsDocClassHeader: undefined,
		// if a UI5 superclass exists we import the package module (the standalone package glue or,
		// in library mode, the "<namespace>/library" module), otherwise the Web Component module
		namespace: ui5Superclass ? `${rootPath}${packageModule}` : webcClass,
		metadata,
		webcClass,
		webcBaseClass: resolvedWebcBaseClass,
		webcBaseClassName,
		needsLabelEnablement,
		needsEnabledPropagator,
		needsMessageMixin,
		importWebCModule: isClazzUI5Element && !!webcClass,
	});

	written.push(writeGeneratedFile(outputDir, resolvedSource, code));
	return written;
}

// -------------------------------------------------------------------------
// programmatic API
// -------------------------------------------------------------------------

/**
 * Processes a custom elements manifest via the WebComponentRegistry and writes
 * the UI5 package glue plus one control wrapper per described class into the
 * output folder.
 *
 * @param {object} opts options
 * @param {string} opts.input path or file:// URL to the custom elements manifest
 * @param {string} opts.output output folder for the generated UI5 control files
 * @param {string} [opts.namespace] npm package namespace (default: name from nearest package.json)
 * @param {string} [opts.ui5Namespace] UI5 namespace used for the generated artifacts, dot or slash notation (default: the npm namespace)
 * @param {string} [opts.stripModulePrefix] leading module path segment to strip from the generated names, e.g. "dist"
 * @param {string} [opts.version] package version (default: version from nearest package.json)
 * @param {string} [opts.frameworkVersion] UI5 framework version for version-dependent generation (default: 2.0.0)
 * @param {boolean} [opts.libraryMode] when true, generate a UI5 library.js (using Library.init) instead of a standalone package module
 * @returns {string[]} the list of generated file paths
 */
function generateControls({ input, output, namespace: namespaceOverride, ui5Namespace, stripModulePrefix, version: versionOverride, frameworkVersion = "2.0.0", libraryMode = false } = {}) {
	if (!input || !output) {
		throw new Error("Both a custom-elements.json path (input) and an output folder (output) are required.");
	}

	const metadataPath = toPath(input);
	if (!existsSync(metadataPath)) {
		throw new Error(`Custom elements manifest not found: ${metadataPath}`);
	}

	let customElementsMetadata;
	try {
		customElementsMetadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
	} catch (err) {
		throw new Error(`Failed to parse custom elements manifest ${metadataPath}: ${err.message}`, { cause: err });
	}

	// derive namespace/version from the nearest package.json unless overridden
	const npmPackagePath = dirname(metadataPath);
	const pkg = findNearestPackageJson(npmPackagePath);
	const namespace = namespaceOverride || pkg?.json?.name;
	const version = versionOverride || pkg?.json?.version;

	if (!namespace) {
		throw new Error("Could not determine the package namespace. Provide it via the namespace option or ensure a package.json is present next to the manifest.");
	}

	const isUI5WebComponents = namespace === UI5_ELEMENT_NAMESPACE || Object.keys(pkg?.json?.dependencies || {}).includes(UI5_ELEMENT_NAMESPACE);

	const outputDir = resolve(output);

	console.log(`Processing "${namespace}"${version ? `@${version}` : ""} from ${metadataPath}`);

	// process the manifest via the WebComponentRegistry (single-file, no dependency resolution)
	WebComponentRegistry.clear();
	const registryEntry = WebComponentRegistry.register({
		customElementsMetadata,
		namespace,
		ui5Namespace,
		stripModulePrefix,
		library: undefined,
		isUI5WebComponents,
		isOpenUI5OrSAPUI5Lib: false,
		frameworkVersion,
		scopeSuffix: undefined, // no scoping in the standalone scenario
		npmPackagePath: pkg ? dirname(pkg.path) : npmPackagePath,
		version,
		skipDtsGeneration: true,
		skipJSDoc: true,
		customJSDocTags: ["private"],
	});

	if (!registryEntry) {
		throw new Error("The WebComponentRegistry did not return an entry for the given manifest.");
	}

	// compile the templates
	const ui5PackageTemplate = loadAndCompileTemplate("UI5Package.hbs");
	const ui5ControlTemplate = loadAndCompileTemplate("UI5Control.hbs");

	const written = [];

	// [1] generate the UI5 package (library) glue — either as a standalone package module
	// or as a proper Library.init() call when libraryMode is requested
	if (libraryMode) {
		const ui5LibraryTemplate = loadAndCompileTemplate("UI5Library.hbs");
		written.push(buildLibrary({ package: registryEntry, template: ui5LibraryTemplate, outputDir }));
	} else {
		written.push(buildPackage({ package: registryEntry, template: ui5PackageTemplate, outputDir }));
	}

	// [2] generate one control wrapper per class described by the metadata.
	// In library mode the package glue lives at "<ui5Namespace>/library.js" (see buildLibrary),
	// otherwise it is the standalone "<ui5Namespace>.js" package module — the wrappers must import
	// whichever one exists, so the UI5 loader does not request a non-existent "<ui5Namespace>.js".
	const packageModule = libraryMode ? `${registryEntry.ui5Namespace}/library` : registryEntry.ui5Namespace;
	const emitted = new Set();
	Object.keys(registryEntry.classes).forEach((cacheKey) => {
		const clazz = registryEntry.classes[cacheKey];
		if (clazz?._ui5metadata) {
			written.push(...buildWrapper({ clazz, template: ui5ControlTemplate, outputDir, emitted, packageModule }));
		}
	});

	console.log(`Generated ${written.length} file(s) into ${outputDir}`);
	return written;
}

// -------------------------------------------------------------------------
// CLI
// -------------------------------------------------------------------------

function main() {
	let options;
	try {
		options = parseArgs(process.argv.slice(2));
	} catch (err) {
		console.error(err.message);
		printUsage();
		process.exit(1);
	}

	if (options.help) {
		printUsage();
		return;
	}

	if (!options.input || !options.output) {
		console.error("Error: both a custom-elements.json path and an output folder are required.\n");
		printUsage();
		process.exit(1);
	}

	try {
		generateControls({
			input: options.input,
			output: options.output,
			namespace: options.namespace,
			ui5Namespace: options.ui5Namespace,
			stripModulePrefix: options.stripModulePrefix,
			version: options.version,
			frameworkVersion: options.frameworkVersion,
		});
	} catch (err) {
		console.error(`Error: ${err.message}`);
		process.exit(1);
	}
}

module.exports = { generateControls };

// only run the CLI when this file is executed directly (not when imported)
if (require.main === module) {
	main();
}
