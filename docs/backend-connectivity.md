---
title: Backend connectivity
layout: default
nav_order: 4
permalink: /backend-connectivity/
description: "Compare the six different ways to connect a UI5 app to a backend service during local development and in production."
---

# Backend connectivity
{: .no_toc }

Six different tools in this repo can connect a UI5 app to a backend. They cover different needs — local-only proxying, embedding a CAP server, BTP destinations, productive deployment with `@sap/approuter`. This page is the head-to-head.
{: .fs-5 .fw-300 }

<details markdown="block">
  <summary>Table of contents</summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Comparison

|  | cds-plugin-ui5 | ui5-middleware-cap | ui5-middleware-approuter | @sap/approuter | dev-approuter | ui5-middleware-simpleproxy |
| --- | --- | --- | --- | --- | --- | --- |
| **Productive use** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| UAA support | (✅) | ❌ | ✅ | ✅ | ✅ | ❌ |
| BTP destinations | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| WebSockets | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Development use** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Embeds UI5 middlewares | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Embeds CAP server | ❌ | ✅ | (✅)¹ | ❌ | ✅ | (✅)¹ |
| Mock UAA support | ✅ | ✅ | (✅)¹ | ❌ | ✅ | (✅)¹ |
| Server processes | 1 | 1 | 2 (UI5 + AppRouter) | 1 + required | 2 (AppRouter + CAP) | 1 + required |

¹ via proxy

## Tool descriptions

### `cds-plugin-ui5`

[`cds-plugin-ui5`](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/cds-plugin-ui5) is a CDS server `cds-plugin` that integrates UI5 CLI based projects (UI5 freestyle or Fiori elements) into the CDS server via the UI5 CLI express middlewares. The UI5 / Fiori elements project just needs to live in the CDS server's `app` folder or be a dependency of the CDS server.

### `ui5-middleware-cap`

[`ui5-middleware-cap`](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/ui5-middleware-cap) improves the development experience for the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/about/) by embedding a CDS server inside the UI5 dev server. The CAP project must be added as a dependency so the server can be discovered and attached. Pre-defined routes in the CAP server are reused.

### `ui5-middleware-approuter`

[`ui5-middleware-approuter`](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/ui5-middleware-approuter) makes `destinations` configured in SAP Cloud Foundry or SAP XS Advanced available for local development, using [`http-proxy-middleware`](https://www.npmjs.com/package/http-proxy-middleware) under the hood.

### `@sap/approuter`

[`@sap/approuter`](https://www.npmjs.com/package/@sap/approuter) is the production application router for SAP BTP / Cloud Foundry / XSA. Components access target services through the application router only when no JWT is yet available (e.g. when a user invokes the app from a browser); already-authenticated callers reach the target services directly.

### `dev-approuter`

[`dev-approuter`](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/dev-approuter) is a **dev-time-only** wrapper around `@sap/approuter` that can serve UI5 and CAP apps added as `(dev)dependencies` to its own `package.json`. Useful when you want approuter behaviour (UAA mocking, destinations, sessions) without a separate UI5 dev server.

### `ui5-middleware-simpleproxy`

[`ui5-middleware-simpleproxy`](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/ui5-middleware-simpleproxy) is the simplest of the bunch — a lightweight express proxy for UI5 dev server. No UAA, no destinations, just forwarding.

---

**Need help picking?** Use the [extension selector](../selecting/) or open a question on the OpenUI5 Slack [#tooling channel](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/).
