#!/usr/bin/env node
/* eslint-disable jsdoc/require-jsdoc */

/**
 * Standalone CLI wrapper around the ui5-tooling-transpile task/middleware logic.
 *
 * Reuses the Babel config + transform pipeline from lib/util.js so that single
 * files or globs can be transpiled without running a full `ui5 build`.
 *
 * Usage:
 *   ui5-transpile [options] <file|glob> [<file|glob> ...]
 *   ui5-transpile [options] -                # read from stdin → stdout
 *
 * See `--help` for the full list of options.
 */

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const PKG = require("../package.json");

// ANSI helpers (matches packages/ui5-task-copyright/bin/uses-ui5-task-copyright.js)
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function err(prefix, ...messages) {
	console.error(`${RED}[${prefix}]${RESET} ${messages.join(" ")}`);
}

function warn(...messages) {
	console.error(`${YELLOW}[WARN]${RESET} ${messages.join(" ")}`);
}

function die(message, error) {
	err("ERROR", message);
	if (error && process.env.UI5_TRANSPILE_DEBUG === "true") {
		console.error(error.stack || error);
	}
	process.exit(1);
}

// Logger compatible with the shape used by lib/util.js (see test/util.test.js).
// All output goes to stderr so stdout stays pipeable for transpiled code.
function makeLogger(debug) {
	const out =
		(level) =>
		(...messages) =>
			console.error(`[${level}] ${messages.join(" ")}`);
	const noop = () => {};
	return {
		silly: debug ? out("silly") : noop,
		verbose: debug ? out("verbose") : noop,
		perf: debug ? out("perf") : noop,
		info: debug ? out("info") : noop,
		warn: out("warn"),
		error: out("error"),
		silent: noop
	};
}

function printHelp() {
	const lines = [
		`Usage: ui5-transpile [options] <file|glob> [<file|glob> ...]`,
		`       ui5-transpile [options] -            # read from stdin → stdout`,
		``,
		`Transpile JavaScript/TypeScript resources via Babel using the same`,
		`configuration the ui5-tooling-transpile task/middleware would apply.`,
		``,
		`Options:`,
		`  -o, --out <file|dir>     Output file (1 input) or directory (N inputs).`,
		`                           Omit for stdout (1 input only).`,
		`      --cwd <dir>          Working directory for config lookup (default: cwd).`,
		`      --ui5-yaml <path>    Explicit ui5.yaml file (default: <cwd>/ui5.yaml if present).`,
		`      --ts                 Force TypeScript transformation on.`,
		`      --no-ts              Force TypeScript transformation off.`,
		`      --no-sourcemaps      Disable source maps.`,
		`      --inline-sourcemaps  Force inline source maps.`,
		`  -w, --watch              Re-transpile on file change (requires -o).`,
		`      --debug              Verbose logging to stderr.`,
		`  -h, --help               Show this help and exit.`,
		`  -v, --version            Print version and exit.`,
		``,
		`Examples:`,
		`  ui5-transpile webapp/Foo.ts`,
		`  ui5-transpile webapp/Foo.ts -o dist/Foo.js`,
		`  ui5-transpile "webapp/**/*.ts" -o dist/`,
		`  ui5-transpile "webapp/**/*.ts" -o dist/ --watch`,
		`  echo 'const x: number = 1' | ui5-transpile --ts -`
	];
	console.log(lines.join("\n"));
}

function parseArgs(argv) {
	const args = {
		inputs: [],
		out: null,
		cwd: process.cwd(),
		ui5YamlPath: null,
		forceTs: null, // null = unset, true/false from --ts/--no-ts
		noSourceMaps: false,
		inlineSourceMaps: false,
		watch: false,
		debug: false,
		stdin: false
	};

	let i = 0;
	const next = (flag) => {
		if (i + 1 >= argv.length) {
			die(`Missing value for ${flag}`);
		}
		return argv[++i];
	};

	let positionalsOnly = false;
	for (; i < argv.length; i++) {
		const token = argv[i];
		if (positionalsOnly) {
			args.inputs.push(token);
			continue;
		}
		switch (token) {
			case "-h":
			case "--help":
				printHelp();
				process.exit(0);
				break;
			case "-v":
			case "--version":
				console.log(PKG.version);
				process.exit(0);
				break;
			case "-o":
			case "--out":
				args.out = next(token);
				break;
			case "--cwd":
				args.cwd = path.resolve(next(token));
				break;
			case "--ui5-yaml":
				args.ui5YamlPath = path.resolve(next(token));
				break;
			case "--ts":
				args.forceTs = true;
				break;
			case "--no-ts":
				args.forceTs = false;
				break;
			case "--no-sourcemaps":
				args.noSourceMaps = true;
				break;
			case "--inline-sourcemaps":
				args.inlineSourceMaps = true;
				break;
			case "-w":
			case "--watch":
				args.watch = true;
				break;
			case "--debug":
				args.debug = true;
				process.env.UI5_TRANSPILE_DEBUG = "true";
				break;
			case "--":
				positionalsOnly = true;
				break;
			case "-":
				args.stdin = true;
				break;
			default:
				if (token.startsWith("-")) {
					die(`Unknown flag: ${token}`);
				}
				args.inputs.push(token);
		}
	}

	// validate mutually-exclusive combinations
	if (args.noSourceMaps && args.inlineSourceMaps) {
		die(`--no-sourcemaps and --inline-sourcemaps are mutually exclusive.`);
	}
	if (args.stdin && (args.inputs.length > 0 || args.out || args.watch)) {
		die(`stdin mode ('-') cannot be combined with positional inputs, -o, or --watch.`);
	}
	if (!args.stdin && args.inputs.length === 0) {
		printHelp();
		process.exit(1);
	}
	if (args.watch && !args.out) {
		die(`--watch requires -o/--out (incremental output to stdout is not supported).`);
	}

	return args;
}

// Locate the ui5.yaml the CLI should honour: explicit > <cwd>/ui5.yaml > none.
function findUi5Yaml(args) {
	if (args.ui5YamlPath) {
		if (!fs.existsSync(args.ui5YamlPath) || !fs.statSync(args.ui5YamlPath).isFile()) {
			die(`The specified ui5.yaml does not exist: ${args.ui5YamlPath}`);
		}
		return args.ui5YamlPath;
	}
	const candidate = path.join(args.cwd, "ui5.yaml");
	return fs.existsSync(candidate) ? candidate : null;
}

// Extract the task (preferred) or middleware configuration block from a ui5.yaml.
// Multiple yaml documents are supported (matches lib/postinstall.js).
function loadUi5Configuration(yamlPath, log) {
	if (!yamlPath) {
		return { configuration: {}, isMiddleware: false };
	}
	let docs;
	try {
		docs = yaml.loadAll(fs.readFileSync(yamlPath, "utf-8"));
	} catch (e) {
		if (e.name === "YAMLException") {
			die(`Failed to parse ${yamlPath}: ${e.message}`);
		}
		throw e;
	}
	for (const doc of docs || []) {
		const task = (doc?.builder?.customTasks || []).find((t) => t.name === "ui5-tooling-transpile-task");
		if (task) {
			log.verbose(`Using task configuration from ${yamlPath}`);
			return { configuration: task.configuration || {}, isMiddleware: false };
		}
	}
	for (const doc of docs || []) {
		const mw = (doc?.server?.customMiddleware || []).find((m) => m.name === "ui5-tooling-transpile-middleware");
		if (mw) {
			log.verbose(`Using middleware configuration from ${yamlPath}`);
			return { configuration: mw.configuration || {}, isMiddleware: true };
		}
	}
	log.verbose(`No ui5-tooling-transpile configuration found in ${yamlPath} — running with defaults.`);
	return { configuration: {}, isMiddleware: false };
}

// Apply CLI flag overrides BEFORE createConfiguration normalizes things.
function applyCliOverrides(configuration, args) {
	const cfg = Object.assign({}, configuration);
	if (args.forceTs !== null) {
		cfg.transformTypeScript = args.forceTs;
	}
	if (args.noSourceMaps) {
		cfg.omitSourceMaps = true;
	}
	if (args.debug) {
		cfg.debug = true;
	}
	return cfg;
}

const GLOB_CHARS = /[*?[\]{}]/;

function isGlob(input) {
	return GLOB_CHARS.test(input);
}

// Resolve positional inputs (files or globs) to a deduped, sorted list of
// absolute paths, filtered by the include/exclude semantics of the task.
function resolveInputs(inputs, normalizedConfig, args, log) {
	const set = new Set();
	const missing = [];

	for (const entry of inputs) {
		if (isGlob(entry)) {
			const matches = fs.globSync(entry, { cwd: args.cwd });
			for (const m of matches) {
				const abs = path.isAbsolute(m) ? m : path.resolve(args.cwd, m);
				if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
					set.add(abs);
				}
			}
		} else {
			const abs = path.isAbsolute(entry) ? entry : path.resolve(args.cwd, entry);
			if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
				set.add(abs);
			} else {
				missing.push(entry);
			}
		}
	}

	if (missing.length > 0) {
		die(`Input file(s) not found:\n  - ${missing.join("\n  - ")}`);
	}

	// Apply include/exclude semantics (same as task/middleware via shouldHandlePath
	// — but the task checks at the workspace path level, here we use FS paths).
	const filtered = [];
	for (const abs of [...set].sort()) {
		const inExcludes = (normalizedConfig.excludes || []).some((p) => abs.includes(p));
		const inIncludes = (normalizedConfig.includes || []).some((p) => abs.includes(p));
		if (inExcludes && !inIncludes) {
			log.verbose(`Skipping (excluded): ${abs}`);
			continue;
		}
		filtered.push(abs);
	}
	return filtered;
}

// Replace any source extension (.ts/.tsx/.js/.jsx/...) with .js.
// Same approach as lib/task.js:119.
function toJsPath(p) {
	return p.replace(/\.[^.]+$/, ".js");
}

// Compute the longest common directory prefix of the inputs (for mirroring).
function commonRoot(absPaths, fallback) {
	if (absPaths.length === 0) {
		return fallback;
	}
	const split = absPaths.map((p) => path.dirname(p).split(path.sep));
	let prefix = split[0];
	for (let i = 1; i < split.length; i++) {
		const cur = split[i];
		let j = 0;
		while (j < prefix.length && j < cur.length && prefix[j] === cur[j]) j++;
		prefix = prefix.slice(0, j);
		if (prefix.length === 0) break;
	}
	const root = prefix.join(path.sep);
	return root || fallback;
}

function deriveSourceMaps(args, writingToFile) {
	if (args.noSourceMaps) return false;
	if (args.inlineSourceMaps) return "inline";
	return writingToFile ? true : "inline";
}

// Transpile a single source string. Returns { code, map?, outPath? }.
async function transpileOne({ util, babelConfig, source, absPath, outPath, args }) {
	const writingToFile = !!outPath;
	const opts = Object.assign({}, babelConfig, {
		filename: absPath,
		sourceMaps: deriveSourceMaps(args, writingToFile)
	});
	const result = await util.transformAsync(source, opts);
	let code = result.code;
	let mapString = null;
	if (result.map && writingToFile && !args.inlineSourceMaps && !args.noSourceMaps) {
		result.map.file = path.basename(outPath);
		mapString = util.normalizeLineFeeds(JSON.stringify(result.map));
		code += `\n//# sourceMappingURL=${result.map.file}.map`;
	}
	return { code: util.normalizeLineFeeds(code), map: mapString, outPath };
}

function writeOutput({ code, map, outPath }) {
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, code, "utf-8");
	if (map) {
		fs.writeFileSync(`${outPath}.map`, map, "utf-8");
	}
}

// Resolve the target output path for a given input given the user's -o setting.
function resolveOutputPath(absInput, inputs, args, root) {
	if (!args.out) return null; // stdout
	const outAbs = path.isAbsolute(args.out) ? args.out : path.resolve(args.cwd, args.out);
	if (inputs.length === 1) {
		// If -o is an existing directory or has a trailing separator, treat as dir.
		const looksLikeDir =
			args.out.endsWith(path.sep) ||
			args.out.endsWith("/") ||
			(fs.existsSync(outAbs) && fs.statSync(outAbs).isDirectory());
		if (looksLikeDir) {
			const rel = path.relative(root, absInput);
			return toJsPath(path.join(outAbs, rel));
		}
		return toJsPath(outAbs);
	}
	// N inputs → -o must be (or become) a directory
	if (fs.existsSync(outAbs) && !fs.statSync(outAbs).isDirectory()) {
		die(`-o must be a directory when multiple inputs are given: ${outAbs}`);
	}
	const rel = path.relative(root, absInput);
	return toJsPath(path.join(outAbs, rel));
}

async function readStdin() {
	return new Promise((resolve, reject) => {
		let data = "";
		process.stdin.setEncoding("utf-8");
		process.stdin.on("data", (chunk) => (data += chunk));
		process.stdin.on("end", () => resolve(data));
		process.stdin.on("error", reject);
	});
}

async function runStdin({ util, babelConfig, args }) {
	const code = await readStdin();
	// Pick a synthetic filename so preset selection (TS vs JS) works.
	const ext = args.forceTs === false ? "stdin.js" : "stdin.ts";
	const result = await util.transformAsync(
		code,
		Object.assign({}, babelConfig, {
			filename: path.join(args.cwd, ext),
			sourceMaps: "inline"
		})
	);
	process.stdout.write(util.normalizeLineFeeds(result.code));
}

async function runOnce({ util, babelConfig, args, normalizedConfig, log }) {
	const resolved = resolveInputs(args.inputs, normalizedConfig, args, log);
	if (resolved.length === 0) {
		warn(`No matching input files after applying include/exclude filters.`);
		return { errors: [], resolved: [] };
	}
	// stdout only allowed for 1 input
	if (!args.out && resolved.length > 1) {
		die(`Multiple inputs require -o <dir> (cannot stream more than one file to stdout).`);
	}
	const root = commonRoot(resolved, args.cwd);
	const errors = [];
	for (const abs of resolved) {
		const outPath = resolveOutputPath(abs, resolved, args, root);
		try {
			const source = fs.readFileSync(abs, "utf-8");
			const out = await transpileOne({ util, babelConfig, source, absPath: abs, outPath, args });
			if (out.outPath) {
				writeOutput(out);
				log.verbose(`Wrote ${out.outPath}`);
			} else {
				process.stdout.write(out.code);
				if (!out.code.endsWith("\n")) process.stdout.write("\n");
			}
		} catch (e) {
			errors.push({ abs, message: e.message || String(e) });
			log.verbose(e.stack || String(e));
		}
	}
	return { errors, resolved };
}

// Watch every unique parent directory of the resolved inputs (recursive on
// platforms that support it — macOS/Windows do). Debounce per file.
function startWatch({ util, babelConfig, args, normalizedConfig, log }) {
	const watchedDirs = new Set();
	const watchers = [];
	const pending = new Map(); // absPath → timeout

	const reprocessOne = async (abs) => {
		// Skip files that don't exist anymore (e.g. deleted)
		if (!fs.existsSync(abs)) return;
		try {
			const source = fs.readFileSync(abs, "utf-8");
			const resolved = resolveInputs(args.inputs, normalizedConfig, args, log);
			if (!resolved.includes(abs)) return; // not part of the input set
			const root = commonRoot(resolved, args.cwd);
			const outPath = resolveOutputPath(abs, resolved, args, root);
			const out = await transpileOne({ util, babelConfig, source, absPath: abs, outPath, args });
			writeOutput(out);
			console.error(`${YELLOW}[watch]${RESET} re-transpiled ${path.relative(args.cwd, abs)}`);
		} catch (e) {
			err("watch", `${path.relative(args.cwd, abs)}: ${e.message || e}`);
		}
	};

	const schedule = (abs) => {
		const prev = pending.get(abs);
		if (prev) clearTimeout(prev);
		pending.set(
			abs,
			setTimeout(() => {
				pending.delete(abs);
				reprocessOne(abs);
			}, 50)
		);
	};

	const initial = resolveInputs(args.inputs, normalizedConfig, args, log);
	for (const abs of initial) {
		watchedDirs.add(path.dirname(abs));
	}
	// Also watch glob roots so newly-created matching files are picked up.
	for (const entry of args.inputs) {
		if (isGlob(entry)) {
			const root = entry.split(GLOB_CHARS)[0];
			const dir = path.resolve(args.cwd, root || ".");
			// climb to the nearest existing directory
			let probe = dir;
			while (probe && !fs.existsSync(probe)) {
				probe = path.dirname(probe);
			}
			if (probe) watchedDirs.add(probe);
		}
	}

	for (const dir of watchedDirs) {
		try {
			const w = fs.watch(dir, { recursive: true }, (eventType, filename) => {
				if (!filename) return;
				const abs = path.resolve(dir, filename);
				schedule(abs);
			});
			watchers.push(w);
			log.verbose(`Watching ${dir}`);
		} catch (e) {
			warn(`Could not watch ${dir}: ${e.message}`);
		}
	}

	const shutdown = () => {
		for (const w of watchers) {
			try {
				w.close();
				// eslint-disable-next-line no-unused-vars
			} catch (_e) {
				/* ignore */
			}
		}
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	console.error(`${YELLOW}[watch]${RESET} watching for changes — press Ctrl+C to stop`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const log = makeLogger(args.debug);

	const yamlPath = findUi5Yaml(args);
	const { configuration, isMiddleware } = loadUi5Configuration(yamlPath, log);

	const merged = applyCliOverrides(configuration, args);

	const util = require("../lib/util")(log);
	let normalizedConfig;
	try {
		normalizedConfig = util.createConfiguration({ configuration: merged, isMiddleware }, args.cwd);
	} catch (e) {
		die(`Failed to build configuration: ${e.message}`, e);
	}
	const babelConfig = await util.createBabelConfig({ configuration: normalizedConfig, isMiddleware }, args.cwd);

	if (args.stdin) {
		await runStdin({ util, babelConfig, args });
		return;
	}

	const { errors } = await runOnce({ util, babelConfig, args, normalizedConfig, log });
	for (const e of errors) {
		err("ERROR", `${path.relative(args.cwd, e.abs)}: ${e.message}`);
	}

	if (args.watch) {
		startWatch({ util, babelConfig, args, normalizedConfig, log });
		return; // process stays alive via watchers
	}

	if (errors.length > 0) {
		process.exit(1);
	}
}

main().catch((e) => die(e.message || String(e), e));
