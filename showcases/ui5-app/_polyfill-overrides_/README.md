# Polyfill Overrides

This directory overlays Node.js core-module polyfills used by `ui5-tooling-modules` during bundling. Every `<module>.js` file here replaces what `rollup-plugin-polyfill-node` would otherwise inject for the matching Node built-in.

## Files

- **`util.js`** — required because `cmis` → `sax` calls `new TextDecoder(...)` from `node:util`. The default polyfill ships a `util` module without `TextEncoder`/`TextDecoder` exports; this override adds them, preferring `globalThis.TextEncoder` / `globalThis.TextDecoder` (always available in browsers) and falling back to the bundled polyfill otherwise.

If the showcase eventually drops `cmis` (or `sax` updates to use the global `TextDecoder` directly), this file can be removed too.
