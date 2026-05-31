---
"ui5-tooling-modules": patch
---

Harden `rewriteDep` path-segment stripping to defeat crafted inputs like `....//` that previously left a residual `../`. Addresses CodeQL alert `js/incomplete-multi-character-sanitization` (#268).
