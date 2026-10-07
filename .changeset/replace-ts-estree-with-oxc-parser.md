---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): replace `@typescript-eslint/typescript-estree` with `oxc-parser`

TypeScript 7 ships without a programmatic API, which breaks `@typescript-eslint/typescript-estree`
(and its transitive `ts-api-utils` dependency) at load time. Since `ui5-tooling-modules` only uses
the parser for syntactic AST generation — no type checking or TypeScript program creation — this
replaces it with `oxc-parser`, a fast Rust-based ESTree-compatible parser that handles JS, TS, JSX
and TSX natively without any dependency on the `typescript` package.

This removes the implicit `typescript <6.1.0` peer dependency constraint, allowing consumers to use
any TypeScript version including TypeScript 7.
