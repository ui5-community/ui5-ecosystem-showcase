---
"ui5-tooling-modules": minor
---

Replace `node-fetch` / `cross-fetch` / `isomorphic-fetch` (and any of their subpath imports) with a virtual rollup shim that re-exports `globalThis.fetch`, `Headers`, `Request`, `Response`, `Blob`, `File`, `FormData`, plus inert `AbortError` / `FetchError` / `isRedirect` stubs. The shim is hooked into the rollup chain before commonjs/polyfill resolution so the Node-only sub-graph (`fetch-blob`, `fs.promises`, `node:net`, …) never enters the browser bundle. Fixes the `"isIP" is not exported by "polyfill-node.net.js"` error that `node-fetch@3` introduced.
