---
title: Selecting an extension
layout: default
nav_order: 3
permalink: /selecting/
description: "A task-oriented picker — find the right UI5 CLI extension for the problem you're solving."
---

# Selecting the right extension
{: .no_toc }

Tell us what you want to do — we'll point you at the right tool.
{: .fs-5 .fw-300 }

> **Start here:** for full-text search across the *entire* community ecosystem (not just the packages in this repo), use [bestofui5.org](https://bestofui5.org/). It indexes tasks, middlewares, UI5 CLI extensions, libraries, controls, Yeoman generators, wdi5 plugins, commands, and applications — all by metadata, with filters by type.

<details markdown="block">
  <summary>Table of contents</summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## During development

| I want to… | Use |
| --- | --- |
| Live-reload my `webapp` whenever a file changes | [`ui5-middleware-livereload`](https://www.npmjs.com/package/ui5-middleware-livereload) |
| Get a generated welcome / start page at `/` | [`ui5-middleware-index`](https://www.npmjs.com/package/ui5-middleware-index) |
| Test the same UI interactions across multiple browsers in parallel | [`ui5-middleware-iasync`](https://www.npmjs.com/package/ui5-middleware-iasync) (alpha) |
| Serve resources of a locally built UI5 framework | [`ui5-middleware-serveframework`](https://www.npmjs.com/package/ui5-middleware-serveframework) |
| Serve plain static resources | [`ui5-middleware-servestatic`](https://www.npmjs.com/package/ui5-middleware-servestatic) |
| Use UI5 apps as `dependencies` in another UI5 app | [`ui5-middleware-ui5`](https://www.npmjs.com/package/ui5-middleware-ui5) |
| Add a generic login layer in front of the dev server | [`ui5-middleware-onelogin`](https://www.npmjs.com/package/ui5-middleware-onelogin) |
| Use WebSockets in my dev server | [`ui5-middleware-websocket`](https://www.npmjs.com/package/ui5-middleware-websocket) |
| Serve content packaged inside a JAR (WebJars) | [`ui5-middleware-webjars`](https://www.npmjs.com/package/ui5-middleware-webjars) |

## Connecting to a backend

UI5 apps rarely live alone — they call OData/REST services, CAP servers, or BTP destinations. The [Backend connectivity](../backend-connectivity/) page covers the full comparison; the short version:

| I want to… | Use |
| --- | --- |
| Reach SAP BTP / Cloud Foundry destinations from local dev | [`ui5-middleware-approuter`](https://www.npmjs.com/package/ui5-middleware-approuter) or [`dev-approuter`](https://www.npmjs.com/package/dev-approuter) |
| Run a CAP CDS server alongside my UI5 dev server | [`ui5-middleware-cap`](https://www.npmjs.com/package/ui5-middleware-cap) or [`cds-plugin-ui5`](https://www.npmjs.com/package/cds-plugin-ui5) |
| Just proxy a few requests to another host | [`ui5-middleware-simpleproxy`](https://www.npmjs.com/package/ui5-middleware-simpleproxy) |

## Build & language tooling

| I want to… | Use |
| --- | --- |
| Write my UI5 app in TypeScript or modern JS (transpile on the fly) | [`ui5-tooling-transpile`](https://www.npmjs.com/package/ui5-tooling-transpile) |
| Use NPM modules directly inside UI5 (`sap.ui.define([...])`) | [`ui5-tooling-modules`](https://www.npmjs.com/package/ui5-tooling-modules) |
| Build LESS files alongside the UI5 build | [`ui5-tooling-less`](https://www.npmjs.com/package/ui5-tooling-less) |
| Replace placeholder strings (e.g. version, env) at build time | [`ui5-tooling-stringreplace`](https://www.npmjs.com/package/ui5-tooling-stringreplace) |

## Packaging & deployment

| I want to… | Use |
| --- | --- |
| Cache-bust standalone applications | [`ui5-task-cachebuster`](https://www.npmjs.com/package/ui5-task-cachebuster) |
| Append copyright headers to JS / TS / XML files | [`ui5-task-copyright`](https://www.npmjs.com/package/ui5-task-copyright) |
| Detect missing i18n texts referenced in XML views | [`ui5-task-i18ncheck`](https://www.npmjs.com/package/ui5-task-i18ncheck) |
| Minify XML resources (views, fragments) | [`ui5-task-minify-xml`](https://www.npmjs.com/package/ui5-task-minify-xml) |
| Produce a Progressive Web App from my UI5 app | [`ui5-task-pwa-enabler`](https://www.npmjs.com/package/ui5-task-pwa-enabler) |
| Bundle my whole `webapp` into a zip (e.g. for SAP BTP deployment) | [`ui5-task-zipper`](https://www.npmjs.com/package/ui5-task-zipper) |
| Flatten the build output for SAP NetWeaver | [`ui5-task-flatten-library`](https://www.npmjs.com/package/ui5-task-flatten-library) |

## Testing

| I want to… | Use |
| --- | --- |
| Run Karma tests on TypeScript / transpiled UI5 sources | [`karma-ui5-transpile`](https://www.npmjs.com/package/karma-ui5-transpile) |

For end-to-end testing of UI5 apps, the community also maintains [**wdi5**](https://ui5-community.github.io/wdi5/) — a WebdriverIO service for UI5. It's not in this repo, but it lives in the same `ui5-community` org and works hand-in-hand with the tooling listed here.

---

**Still not sure?** Browse the [full extensions catalog](../extensions/) or search the wider ecosystem on [bestofui5.org](https://bestofui5.org/).
