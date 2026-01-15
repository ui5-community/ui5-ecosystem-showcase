# karma-ui5-transpile

> :warning: This project has been deprecated. We recommend you to pick a successor from the [available UI5 community projects](https://bestofui5.org/#/packages?tokens=testing:tag). For more information see [Deprecation of karma-ui5 plugin](https://community.sap.com/t5/technology-blogs-by-sap/deprecation-of-karma-ui5-plugin/ba-p/13954060).

> :wave: This is an **open‑source, community‑driven project**, developed and actively monitored by members of the UI5 community. You are welcome to use it, report issues, contribute enhancements, and support others in the community.

The `karma-ui5-transpile` preprocessor transpiles code of UI5 projects having a `ui5.yaml` using `ui5-tooling-transpile` UI5 CLI extension. This preprocesser is usable for [Karma](https://karma-runner.github.io/) testing to transpile your resources before testing (i.e. TypeScript compilation for later usage of the [`karma-coverage`](https://www.npmjs.com/package/karma-coverage) plugin).

## Prerequisites

The plugin requires [`karma`](https://www.npmjs.com/package/karma) `>=6.4.1`, and [ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile) `>=3.0.0`.

## Installation

You can install the required dependencies with the following command:

```sh
npm install --save-dev karma karma-coverage ui5-tooling-transpile karma-ui5 karma-ui5-transpile
```

The usage of the [`karma-ui5`](https://www.npmjs.com/package/karma-ui5) plugin is obligatory as it integrates UI5 into the Karma testing flow although it is not directly necessary for the `karma-ui5-transpile` plugin. Only the configuration is read from the `karma-ui5` plugin. The plugin `karma-coverage` is also optional as it can be used for the creation of the coverage report. As a preprocessor it is not needed when using `karma-ui5-transpile`.

## Configuration

See [ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile) for more details about the possible configurations in the `ui5.yaml` of your UI5 project.

If you have a custom `ui5.yaml` for testing the plugin reads the configuration from the [`karma-ui5`](https://www.npmjs.com/package/karma-ui5) plugin, i.e.:

```js
module.exports = function (config) {
  config.set({
    [...]
    ui5: {
      configPath: "ui5-dist.yaml",
    },
    [...]
  });
};
```

## Code Coverage for UI5 projects using `ui5-tooling-transpile`

To enable code coverage for your UI5 project using `ui5-tooling-transpile`, you can install and use the `karma-ui5-transpile` to preprocess your source files of your project. It uses the same configuration as the `ui5-tooling-transpile` and `karma-ui5`.

Let's assume you already use the UI5 CLI extension `ui5-tooling-transpile` and all is configured properly in `ui5.yaml`. To add code coverage, we first need to install all required dependencies `karma`, `karma-ui5`, `karma-ui5-transpile`, `karma-coverage`, and `karma-chrome-launcher` which are needed for the automated execution of your e.g. QUnit or OPA tests:

```sh
npm install --save-dev karma karma-ui5 karma-ui5-transpile karma-coverage karma-chrome-launcher
```

Second, in your `karma.conf.js` (or better you create separate ones for different scenarios), you need to configure the preprocessor `ui5-transpile` for which local paths is should run. Below we use the preprocessor for all `.ts` resources in the `webapp` folder - also defining multiple folders is possible, e.g. `src/**/*.ts` and `test/**/*.ts` for typical UI5 library projects:

```js
module.exports = function (config) {
  config.set({
    frameworks: ["ui5"],
    browsers: ["Chrome"],
    reporters: ["progress", "coverage"],
    preprocessors: {
      "webapp/**/*.ts": ["ui5-transpile"],
    },
    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "report-html" },
        { type: "cobertura", subdir: ".", file: "cobertura.txt" },
        { type: "lcovonly", subdir: ".", file: "report-lcovonly.txt" },
        { type: "text-summary" },
      ],
    },
  });
};
```

:warning: When using the `ui5-transpile` preprocessor please avoid using the `coverage` preprocessor as the instrumentation will also take place during the `ui5-transpile` Babel transformation process. If you use both, you will see a warning in the console and instrument your source files twice!

That's it! Now, you are able to run your coverage tests with Karma for your TypeScript-based UI5 projects. To do so, just run:

```sh
karma start
```

If you are interested in out of the box examples, you can find them in the [UI5 Ecosystem Showcase repository](https://github.com/ui5-community/ui5-ecosystem-showcase/) within the `showcases` folder:

* [TypeScript-based UI5 application](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/showcases/ui5-tsapp)
* [TypeScript-based UI5 library](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/showcases/ui5-tslib)

The TypeScript-based projects genereted with [Easy UI5](https://www.npmjs.com/package/generator-easy-ui5) soon contain the setup for coverage testing with Karma for the QUnit and for OPA testing.

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of UI5 CLI extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
