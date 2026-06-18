---
title: Extensions
layout: default
nav_order: 2
permalink: /extensions/
description: "Full catalog of the 27 UI5 CLI extensions published from this monorepo."
---

# Extensions catalog
{: .no_toc }

The 27 packages below are all maintained in this monorepo and published to NPM under the [`ui5-community`](https://github.com/ui5-community) ownership. Picking the right one? See [Selecting an extension](../selecting/).
{: .fs-5 .fw-300 }

> **Looking beyond this repo?** [Best of UI5](https://bestofui5.org/) indexes a much wider set of community packages — tasks, middlewares, libraries, controls, generators, and more. It's the recommended starting point for *finding* a UI5 extension. Most (but [not all](#packages-not-yet-on-best-of-ui5)) of the packages on this page are also indexed there.

<details markdown="block">
  <summary>Table of contents</summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

{% assign categories = "Middleware,Task,Tooling,CDS Integration,Test Tooling,Utility" | split: "," %}
{% for category in categories %}

## {{ category }}

| Package | Description | Links |
| --- | --- | --- |
{%- assign cat_pkgs = site.data.packages | where: "category", category | sort: "name" -%}
{% for pkg in cat_pkgs %}
| **[{{ pkg.name }}](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/{{ pkg.github_path }})** | {{ pkg.description }}{% unless pkg.bestofui5_indexed %} <br />*Not currently indexed on bestofui5.org.*{% endunless %} | [![npm](https://badge.fury.io/js/{{ pkg.npm }}.svg)](https://www.npmjs.com/package/{{ pkg.npm }}){% if pkg.bestofui5_indexed %} · [Best of UI5](https://bestofui5.org/#/packages/{{ pkg.npm }}){% endif %} |
{% endfor %}

{% endfor %}

## Packages not yet on Best of UI5

{% assign missing = site.data.packages | where: "bestofui5_indexed", false | sort: "name" %}
The following {{ missing.size }} packages are published to NPM and maintained in this repository but are not currently indexed on [bestofui5.org](https://bestofui5.org/):

{% for pkg in missing %}- [`{{ pkg.name }}`](https://www.npmjs.com/package/{{ pkg.npm }}) — {{ pkg.description }}
{% endfor %}

If you maintain one of these and would like it indexed, you can [submit it](https://github.com/ui5-community/bestofui5-data/issues/new?assignees=marianfoo&labels=new%20package&template=new_package.md&title=Add%20new%20Package:) to the Best of UI5 data repository.
