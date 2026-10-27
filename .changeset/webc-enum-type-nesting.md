---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): nest Web Component enums/types under their module namespace and align runtime, JSDoc and TypeScript types

Enums (and type references) generated for Web Component packages are now placed at their real
access path inside the package module (e.g. `pkg.dist.types.AvatarSize`) instead of flat under
their raw custom-elements export name (e.g. `pkg["AvatarSize"]`, or even a diverging name such as
`pkg["Positions"]`). The JS object path now matches the `DataType.registerEnum` name, the JSDoc
`@alias`/`@ui5-module-override` and the generated TypeScript types.

- **JSDoc:** enum `@alias`, enum/interface `@type` and `@implements` now use the correct
  `module:<package-module-in-slashes>.<access-path-in-dots>` form (e.g.
  `module:…/webcomponents.dist.types.AvatarSize`) instead of an all-slashes path that wrongly
  implied a nested module. Control class references keep the all-slashes module form, since each
  wrapper is its own module.
- **`.d.ts`:** the package module declaration now emits grouped nested `export namespace` blocks
  (e.g. `export namespace dist { export namespace types { enum AvatarSize { … } } }`), mirroring
  how UI5 libraries declare sub-namespaced enums (`sap/ui/core/library` → `dnd.DropEffect`). Class
  declarations reference these enums via the package's namespace binding
  (`import { dist }` → `dist.types.AvatarSize`), aliased per package (e.g. `dist as
  ui5_webcomponents_dist`) to avoid collisions when a class references enums from several packages.
  Interfaces remain top-level, matching UI5's handling of marker interfaces.

Consumers that imported enums via the old flat top-level name must switch to the nested access
(e.g. `pkg.dist.types.AvatarSize`). For projects that need to bump `ui5-tooling-modules` on older
UI5 versions without adapting consumer code yet, a new opt-in compat switch
`pluginOptions/webcomponents/compat/legacyEnumExport` re-adds the old flat enum export in the
runtime package module (as a reference to the nested object). It defaults to `false`.
