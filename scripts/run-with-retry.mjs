#!/usr/bin/env node
// Run `pnpm run version-packages` with retries on the known
// `@changesets/get-github-info` flake.
//
// Upstream bug: @changesets/get-github-info@0.8.0 pulls in node-fetch@2,
// whose keep-alive handling intermittently surfaces as
// `Invalid response body while trying to fetch https://api.github.com/graphql: Premature close`
// on Node 22+. The failure is fail-safe -- no version bumps are written
// when the GraphQL call errors -- so a plain retry is sufficient.
//
// Refs:
//   https://github.com/changesets/changesets/issues/2123
//   https://github.com/changesets/changesets/issues/2115
//   https://github.com/node-fetch/node-fetch/issues/1219
//
// Behaviour:
//   * up to 3 attempts (configurable via RETRY_MAX_ATTEMPTS)
//   * exponential backoff: 5s, 15s, 45s (configurable via RETRY_BASE_DELAY_MS)
//   * only retries when stderr matches the upstream signature -- any
//     other failure is surfaced immediately
//   * stdout/stderr are streamed live so CI logs stay readable

import { spawn } from "node:child_process";

const MAX_ATTEMPTS = Number(process.env.RETRY_MAX_ATTEMPTS) || 3;
const BASE_DELAY_MS = Number(process.env.RETRY_BASE_DELAY_MS) || 5000;

// stderr fragments that mark the known-flaky GraphQL stream close.
// Match generously -- node-fetch wraps the underlying ERR_STREAM_PREMATURE_CLOSE
// in a few different surface messages over time.
const RETRYABLE_PATTERNS = [/Failed to parse data from GitHub/i, /Invalid response body while trying to fetch https:\/\/api\.github\.com\/graphql/i, /ERR_STREAM_PREMATURE_CLOSE/i, /Premature close/i];

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function runOnce(command, args) {
	return new Promise((resolve) => {
		let stderrBuf = "";
		const child = spawn(command, args, { stdio: ["inherit", "inherit", "pipe"] });
		child.stderr.on("data", (chunk) => {
			const text = chunk.toString();
			stderrBuf += text;
			process.stderr.write(text);
		});
		child.on("error", (err) => {
			resolve({ code: 1, stderr: stderrBuf + String(err) });
		});
		child.on("close", (code) => {
			resolve({ code: code ?? 1, stderr: stderrBuf });
		});
	});
}

function isRetryable(stderr) {
	return RETRYABLE_PATTERNS.some((re) => re.test(stderr));
}

async function main() {
	const [, , scriptName, ...extra] = process.argv;
	if (!scriptName) {
		console.error("usage: run-with-retry.mjs <pnpm-script-name> [extra args...]");
		process.exit(2);
	}

	// Prefer the pnpm that invoked us (npm_execpath is set by pnpm when running scripts);
	// fall back to a plain `pnpm` lookup on PATH for direct `node scripts/...` invocations.
	const execpath = process.env.npm_execpath;
	const usePnpmCli = execpath && /pnpm(\.cjs|\.js)?$/.test(execpath);
	const command = usePnpmCli ? process.execPath : "pnpm";
	const args = usePnpmCli ? [execpath, "run", scriptName, ...extra] : ["run", scriptName, ...extra];

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		console.log(`[run-with-retry] attempt ${attempt}/${MAX_ATTEMPTS}: pnpm run ${scriptName}`);
		const { code, stderr } = await runOnce(command, args);

		if (code === 0) {
			if (attempt > 1) {
				console.log(`[run-with-retry] succeeded on attempt ${attempt}`);
			}
			process.exit(0);
		}

		const retryable = isRetryable(stderr);
		console.error(`[run-with-retry] attempt ${attempt} failed with exit code ${code} (retryable=${retryable})`);

		if (!retryable || attempt === MAX_ATTEMPTS) {
			process.exit(code || 1);
		}

		const wait = BASE_DELAY_MS * 3 ** (attempt - 1);
		console.error(`[run-with-retry] sleeping ${wait}ms before retry`);
		await delay(wait);
	}
}

main().catch((err) => {
	console.error("[run-with-retry] unexpected error:", err);
	process.exit(1);
});
