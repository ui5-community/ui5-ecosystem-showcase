---
"ui5-tooling-modules": minor
---

feat(ui5-tooling-modules): support `_ui5mapping` hint on custom element members

A CEM producer can now attach a `_ui5mapping` object to a field member. The object is merged over the mapping that `WebComponentRegistry` computes for the generated UI5 property, allowing a package to refine the mapping — e.g. force a `type: "none"` mapping, set an explicit `to`, or declare a `syncOn` native event that syncs the live DOM value back into the control. A plain `"property"` string mapping is normalized to object form before merging.
