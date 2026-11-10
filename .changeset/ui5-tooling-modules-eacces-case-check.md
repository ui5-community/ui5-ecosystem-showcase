---
"ui5-tooling-modules": patch
---

fix(ui5-tooling-modules): tolerate non-listable ancestor directories in the case-sensitive existence check

The case-sensitive existence check lists every parent directory up to the file system root. If an ancestor of the project can be traversed but not listed (e.g. mode `711` on shared or multi-tenant build hosts), `readdirSync` threw `EACCES` and bundling failed for every npm package. The check now stops climbing at such a directory and only verifies that the path exists.
