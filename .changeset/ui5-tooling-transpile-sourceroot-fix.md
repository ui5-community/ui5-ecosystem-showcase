---
"ui5-tooling-transpile": patch
---

fix(ui5-tooling-transpile): preserve user-configured sourceRoot in emitted source maps

The babelConfig.sourceRoot is overwritten with the absolute project root during transformation to ensure babel-plugin-transform-modules-ui5 resolves namespaces correctly in nested builds. However, this absolute value was leaking into the emitted source maps, making them non-portable.

After the Babel transformation, restore the user-configured sourceRoot (e.g. "./") to the emitted map. This keeps source maps portable while maintaining the absolute sourceRoot needed during the transform phase.

Users can now use `babelConfig.sourceRoot: "./"` in their ui5.yaml configuration and get properly portable source maps with relative paths instead of absolute machine-specific paths.
