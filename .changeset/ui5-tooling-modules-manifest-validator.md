---
"ui5-tooling-modules": minor
---

Add upfront validation of Web Components custom-elements manifests. Each `custom-elements.json` / `custom-elements-internal.json` is now run through a dedicated validator immediately after parsing, producing a grouped, severity-ranked report of issues (with stable `WCV###` codes) instead of scattered warnings deep inside the parser. The previously eager `logger.warn`/`logger.error` calls in `WebComponentRegistry` have been retired in favour of the upfront report; runtime fallbacks are unchanged. A new opt-in plugin option `failOnManifestError` (default `false`) lets builds abort when any validator error is found.
