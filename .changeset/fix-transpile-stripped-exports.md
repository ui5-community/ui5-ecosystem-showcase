---
"ui5-tooling-transpile": patch
---

fix(ui5-tooling-transpile): preserve `export` modifier on top-level
declarations in generated `.d.ts` files

When the task generates `.d.ts` files for a TypeScript library it wraps the
original source in `declare module "<fqn>" { ... }` so the emitted type
definition references the fully-qualified UI5 module name. TSC's d.ts
emitter however strips the `export` modifier from declarations inside an
ambient module body, turning previously-exported `type` / `enum` /
`interface` / `class` / `function` / `const` / `let` / `var` / `namespace`
declarations into module-private symbols that consumers can no longer
import.

The task now post-processes the emitted d.ts: it collects the names that
were re-exported in the original source and re-prepends `export` to the
matching top-level declarations inside the wrapped module body. Names that
were never exported in the source remain module-private as before.

Fixes #1380.
