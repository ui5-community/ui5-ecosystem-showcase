---
"ui5-tooling-transpile": minor
---

Add native JSX/TSX transformation and coverage instrumentation support.

- New `transformJSX` configuration option (`boolean|Object`) enables the optional peer dependency [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/babel-plugin-transform-react-jsx) to transform JSX/TSX syntax. When the value is an object, it is passed through as the plugin's options (e.g. `runtime`, `importSource`). When enabled and no explicit `filePattern` is set, the default file pattern is extended to also handle `jsx`/`tsx` files (`.+(js|jsx)` or `.+(ts|tsx)`).
- New `coverage` configuration option (`boolean|Object`) enables the optional peer dependency [`babel-plugin-istanbul`](https://www.npmjs.com/package/babel-plugin-istanbul) to instrument the transpiled code for coverage collection. When the value is an object, it is passed through as the plugin's options.
- Both plugins are only added when the respective configuration option is present/truthy AND the optional dependency can be resolved; otherwise a warning is logged and transpilation continues without the plugin. Both are declared as optional `peerDependencies`.
