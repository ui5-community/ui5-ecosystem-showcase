---
"ui5-tooling-modules": patch
---

fix: suppress harmless INVALID_ANNOTATION Rollup warnings from zod/pdfmake, and eliminate UNRESOLVED_IMPORT warnings for hasown/es-object-atoms by shimming isomorphic-form-data (a cmis transitive dep) to globalThis.FormData instead of bundling the Node-only form-data chain
