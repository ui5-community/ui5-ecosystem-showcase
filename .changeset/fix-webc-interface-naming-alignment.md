---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): align `@implements` JSDoc with the `interfaces`
metadata declaration in generated WebComponent wrappers

The generated wrappers (`dist/gen/.../<Component>-dbg.js`) emitted an
`@implements` JSDoc that did not match the `interfaces` metadata
declaration it was meant to describe. The interfaces declaration was
already correct (e.g. `....dist.Button.IButton` — the interface as a
sibling of its host class module), but the JSDoc was hand-built from
`${this.namespace}.${interfaceDef.name}` and dropped the `dist/<Class>`
segment entirely.

The JSDoc emission now reuses the precomputed
`_ui5QualifiedNameSlashes` so it is built from the same source of
truth as the metadata, producing the proper named-export module shape
(slashes in the module path, dot before the named export, e.g.
`module:.../dist/Button.IButton`). JSDoc and metadata are now in
lockstep by construction.
