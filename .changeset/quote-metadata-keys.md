---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): keep metadata property keys quoted in generated control wrappers

The `create-webc-controls` CLI now formats the generated sources with prettier's `quoteProps: "preserve"`, so metadata property names that are reserved words (e.g. HTML's `class`) stay quoted. Previously prettier's default `as-needed` emitted them unquoted which, although valid ES5+, was rejected by stricter validators (e.g. the OpenUI5 test setup).
