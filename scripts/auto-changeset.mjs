#!/usr/bin/env node
// Auto-generate Changesets entries from conventional commits.
//
// Reads the commits in the configured range and emits one
// .changeset/auto-<short-sha>.md per commit that affects a published
// package. The CLI is a faster path than `pnpm changeset` for the common
// case where the commit message already encodes the bump (`feat:` ->
// minor, `fix:` -> patch, `!`/`BREAKING CHANGE:` -> major) and the
// scope already names the affected packages.
//
// Usage:
//   pnpm changeset:auto              # commits ahead of origin/main
//   pnpm changeset:auto --since=<ref>
//   pnpm changeset:auto --dry-run    # print, don't write
//   pnpm changeset:auto --verbose    # log per-commit decisions
//
// Skip rules: commits whose `type` is `ci`, whose scope is `release`,
// or that touch no `packages/*` files. A commit is also skipped when
// any existing .changeset/*.md already lists one of the packages it
// would target -- the assumption is that a human has already written
// the entry for that change.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(REPO_ROOT, "packages");
const CHANGESET_DIR = join(REPO_ROOT, ".changeset");

// --- CLI args ----------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");
const sinceArg = args.find((a) => a.startsWith("--since="))?.slice("--since=".length);

// --- helpers -----------------------------------------------------------------

function git(...gitArgs) {
	return execFileSync("git", gitArgs, { cwd: REPO_ROOT, encoding: "utf8" }).trimEnd();
}

function gitOptional(...gitArgs) {
	try {
		return git(...gitArgs);
	} catch {
		return null;
	}
}

function log(...msg) {
	if (verbose) console.log(...msg);
}

// --- discover packages -------------------------------------------------------

function loadPublishablePackages() {
	const out = new Map(); // name -> { dir, private }
	for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const pkgPath = join(PACKAGES_DIR, entry.name, "package.json");
		if (!existsSync(pkgPath)) continue;
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		if (pkg.private === true) continue;
		out.set(pkg.name, { dir: entry.name });
	}
	return out;
}

const PACKAGES = loadPublishablePackages();
// Reverse lookup: directory name -> package name. Most packages have
// matching dir/pkg names but some (e.g. dev-approuter) don't, so we
// can't conflate them.
const DIR_TO_NAME = new Map();
for (const [name, info] of PACKAGES) DIR_TO_NAME.set(info.dir, name);

// --- existing changesets -----------------------------------------------------

function packagesAlreadyCovered() {
	const covered = new Set();
	if (!existsSync(CHANGESET_DIR)) return covered;
	for (const file of readdirSync(CHANGESET_DIR)) {
		if (!file.endsWith(".md") || file === "README.md") continue;
		const body = readFileSync(join(CHANGESET_DIR, file), "utf8");
		// Frontmatter sits between the first two `---` lines. Inside, each
		// non-empty line follows `"<pkg>": <bump>`.
		const match = body.match(/^---\n([\s\S]*?)\n---/);
		if (!match) continue;
		for (const line of match[1].split("\n")) {
			const m = line.match(/^"([^"]+)":\s*(major|minor|patch)\s*$/);
			if (m) covered.add(m[1]);
		}
	}
	return covered;
}

// --- commit range ------------------------------------------------------------

function resolveCommitRange() {
	if (sinceArg) return `${sinceArg}..HEAD`;

	// Try merge-base against origin/main first.
	const mergeBase = gitOptional("merge-base", "origin/main", "HEAD");
	const head = git("rev-parse", "HEAD");
	if (mergeBase && mergeBase !== head) {
		return `${mergeBase}..HEAD`;
	}

	// On main (or no divergence): fall back to the last release commit.
	// Look for the most recent `chore(release): publish` commit.
	const lastRelease = gitOptional("log", "--format=%H", "--grep=^chore(release): publish$", "-n", "1");
	if (lastRelease) return `${lastRelease}..HEAD`;

	throw new Error("could not determine commit range (no merge-base with origin/main and no `chore(release): publish` commit found). Pass --since=<ref>.");
}

// --- commit parsing ----------------------------------------------------------

const SUBJECT_RE = /^(?<type>\w+)(?:\((?<scopes>[^)]+)\))?(?<bang>!?):\s+(?<subject>.+)$/;

function readCommits(range) {
	// %x1F is the ASCII unit-separator; safe within commit messages.
	// Format: <sha>\x1F<subject>\x1F<body>\x00
	const raw = git("log", "--format=%H%x1F%s%x1F%b%x00", "--reverse", range);
	if (!raw) return [];
	return raw
		.split("\x00")
		.map((s) => s.replace(/^\n+/, ""))
		.filter(Boolean)
		.map((entry) => {
			const [sha, subject, body] = entry.split("\x1F");
			return { sha, subject, body: body ?? "" };
		});
}

function changedFiles(sha) {
	return git("diff-tree", "--no-commit-id", "--name-only", "-r", sha).split("\n").filter(Boolean);
}

// --- classification ----------------------------------------------------------

function classify(commit, covered) {
	const m = commit.subject.match(SUBJECT_RE);
	if (!m) return { skip: "subject does not match conventional-commit shape" };
	const { type, scopes, bang, subject } = m.groups;

	if (type === "ci") return { skip: "ci-only commit" };
	const scopeList = scopes ? scopes.split(",").map((s) => s.trim()) : [];
	if (scopeList.includes("release")) return { skip: "release commit" };

	const files = changedFiles(commit.sha);
	const touchedPackageDirs = new Set();
	for (const f of files) {
		const m2 = f.match(/^packages\/([^/]+)\/(.+)$/);
		if (!m2) continue;
		// Test-only paths don't ship in the published tarball, so a
		// touch under test/ alone does not mean the package needs a
		// release. The most common false positive is a regenerated
		// snapshot triggered by a dependency bump elsewhere in the
		// monorepo (e.g. chart.js bump in a showcase regenerates
		// packages/ui5-tooling-modules/test/__snap__/.../chart.js).
		if (/^(test|tests|__tests__)\//.test(m2[2])) continue;
		touchedPackageDirs.add(m2[1]);
	}
	if (touchedPackageDirs.size === 0) {
		return { skip: "no shipping packages/ files affected" };
	}

	// Build the set of affected package *names*.
	let pkgNames;
	if (scopeList.length > 0 && scopeList.every((s) => PACKAGES.has(s))) {
		pkgNames = scopeList;
	} else {
		// Either no scope, or scope tokens aren't package names (e.g.
		// `chore: bump minimatch` with no scope, or `feat(ci):`). Fall
		// back to whatever directories were touched, mapped to package
		// names.
		pkgNames = [...touchedPackageDirs].map((d) => DIR_TO_NAME.get(d)).filter(Boolean);
	}
	pkgNames = [...new Set(pkgNames)].filter((n) => PACKAGES.has(n));
	if (pkgNames.length === 0) {
		return { skip: "scope/paths did not resolve to any publishable package" };
	}

	// Bump determination.
	let bump;
	if (bang === "!" || /^BREAKING CHANGE:/m.test(commit.body)) {
		bump = "major";
	} else if (type === "feat") {
		bump = "minor";
	} else if (["fix", "perf", "refactor", "chore", "build", "style"].includes(type)) {
		bump = "patch";
	} else if (type === "docs") {
		// Docs only get a changeset when explicitly scoped to a package.
		if (scopeList.length === 0) return { skip: "docs without package scope" };
		bump = "patch";
	} else {
		return { skip: `type '${type}' does not produce a changeset` };
	}

	// Skip-if-covered.
	const overlap = pkgNames.filter((n) => covered.has(n));
	if (overlap.length > 0) {
		return { skip: `already covered (${overlap.join(", ")})` };
	}

	return { pkgNames, bump, subject };
}

// --- write -------------------------------------------------------------------

function writeChangeset(sha, pkgNames, bump, subject) {
	const short = sha.slice(0, 8);
	const filename = `auto-${short}.md`;
	const path = join(CHANGESET_DIR, filename);
	if (existsSync(path)) {
		return { path, filename, skipped: "file already exists" };
	}
	const frontmatter = pkgNames.map((n) => `"${n}": ${bump}`).join("\n");
	const body = `---\n${frontmatter}\n---\n\n${subject}\n`;
	if (!dryRun) {
		mkdirSync(CHANGESET_DIR, { recursive: true });
		writeFileSync(path, body);
	}
	return { path, filename };
}

// --- main --------------------------------------------------------------------

function main() {
	const range = resolveCommitRange();
	const commits = readCommits(range);
	const covered = packagesAlreadyCovered();
	let written = 0;
	let skipped = 0;

	console.log(`Scanning ${commits.length} commit(s) in range ${range}.`);
	if (covered.size > 0) {
		log(`Pre-existing coverage: ${[...covered].sort().join(", ")}`);
	}

	for (const commit of commits) {
		const decision = classify(commit, covered);
		const short = commit.sha.slice(0, 8);
		if (decision.skip) {
			log(`  - skip ${short}: ${decision.skip}`);
			skipped++;
			continue;
		}
		const { pkgNames, bump, subject } = decision;
		const { filename, skipped: writeSkip } = writeChangeset(commit.sha, pkgNames, bump, subject);
		if (writeSkip) {
			log(`  - skip ${short}: ${writeSkip}`);
			skipped++;
			continue;
		}
		const pkgList = pkgNames.length === 1 ? pkgNames[0] : `{${pkgNames.join(",")}}`;
		const tag = dryRun ? "would write" : "wrote";
		console.log(`  ✓ ${tag} .changeset/${filename}  (${pkgList}: ${bump})`);
		written++;
	}

	const verb = dryRun ? "would write" : "wrote";
	console.log(`\n${verb} ${written} changeset(s), skipped ${skipped}.`);
}

main();
