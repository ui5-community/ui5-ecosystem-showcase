# karma-ui5-transpile

The `karma-ui5-transpile` preprocessor transpiles code of UI5 projects having a `ui5.yaml` using `ui5-tooling-transpile` tooling extension. This preprocesser is usable for [Karma](https://karma-runner.github.io/) testing to transpile your resources before testing (i.e. TypeScript compilation for later usage of the [`karma-coverage`](https://www.npmjs.com/package/karma-coverage) plugin).

## Installation

The plugin requires [`karma`](https://www.npmjs.com/package/karma) `>=6.4.1`, and [ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile) `>=0.6.0`. You can install the required dependencies with the following command: 

```sh
npm install --save-dev karma ui5-tooling-transpile karma-ui5-transpile
```

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

## Code Coverage for UI5 TypeScript projects

To enable code coverage for your TypeScript-based UI5 project, you can use the `karma-ui5-transpile` to preprocess your TypeScript files in your project before passing them to the `karma-coverage` preprocessor to instrument them. Therefore, you first need to install the required Karma dependencies:

```sh
npm install --save-dev karma karma-ui5-transpile karma-coverage karma-chrome-launcher
```

In the scenario above, we assume that you already use the dependency to `ui5-tooling-transpile` and you have a proper configuration in the `ui5.yaml` for this tooling extension. The above installation script installs the dependencies for `karma`, `karma-ui5-transpile`, `karma-coverage`, and `karma-chrome-launcher` which are needed for the automated execution of your e.g. QUnit tests.

In your `karma.conf.js` (or better you create separate ones for different scenarios), you need to configure the preprocessors (for which local folder they will run - below we use the preprocessor for all `.ts` resources in the `webapp` folder - also defining multiple folders is possible, e.g. `src/**/*.ts` and `test/**/*.ts` for typical UI5 library projects):

```js
module.exports = function (config) {
  config.set({
    frameworks: ["ui5"],
    browsers: ["Chrome"],
    reporters: ["progress", "coverage"],
    preprocessors: {
      "webapp/**/*.ts": ["ui5-transpile", "coverage"],
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

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
