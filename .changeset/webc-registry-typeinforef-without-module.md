---
"ui5-tooling-modules": patch
---

Guard the complex-type lookup in [WebComponentRegistry#parseComplexType](packages/ui5-tooling-modules/lib/utils/WebComponentRegistry.js) against type references that have no `module`. `WebComponentRegistryHelper.deriveCacheKey` returns `undefined` for such references, which previously caused the cross-package lookup and "global import" fallback to misfire (e.g. logging `Reference package '…' for complex type '…' not found` and producing unusable cache entries). When `typeInfoRef.module` is missing, skip the complex-type resolution entirely and fall through to the `any` fallback.
