---
"cds-plugin-ui5": patch
"ui5-middleware-cap": patch
---

Bump the `express` peerDependency floor from `>=4.18.2` to `>=4.19.2` so the declared range no longer permits versions affected by GHSA-rv95-896h-c2vc (open redirect). Closes Dependabot alerts #110, #111, #113, #114, #115, #117.
