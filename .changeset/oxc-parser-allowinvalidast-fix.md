---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): restore partial-AST dependency scanning after oxc-parser migration

`oxc-parser` always performs error recovery and returns a (possibly partial) program even when errors
are present — matching the `allowInvalidAST: true` behaviour of the replaced
`@typescript-eslint/typescript-estree`. An early `return` on `errors.length > 0` introduced during
the migration caused files with minor parse issues to be silently skipped entirely instead of having
their dependencies extracted from the recovered AST.

Also removes two dead AST mutations (`argument.raw` / `elDep.raw`) in the `isA` rewrite path of
`task.js` that used the already-mutated value as a map key (yielding `"undefined"`) and were never
read back since AST-based code generation was replaced by regex substitution.
