---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): harden build task/middleware against concurrency

Hardens the build task and dev-server middleware against async interleaving and shared process-global state across overlapping builds:

- Serialize rollup builds process-wide via a build lock so the global `WebComponentRegistry` can no longer be clobbered by an overlapping `buildStart`.
- Force-rebuild and await when the middleware receives a request for a not-yet-bundled module, so it is served instead of falling through to a 404.
- Deduplicate concurrent `getBundleInfo` misses on the same cache key via an in-flight promise map.
- Make `BundleInfoCache` writes atomic (temp file + rename), awaited/flushable, and defensive on read.
- Track and flush `DTSSerializer` `.gen.d.ts` writes with error logging so builds no longer report success while writes are pending or silently failing.
- Replace destructive `deactivate()` on the serializer singletons with a reversible `setEnabled` flag reset per registration, so generation settings no longer leak across projects in the same process.

Observable happy-path output is unchanged (bundles and generated `.d.ts` are byte-identical).
