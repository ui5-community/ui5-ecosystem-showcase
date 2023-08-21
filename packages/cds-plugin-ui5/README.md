# cds-plugin-ui5

> :wave: This is a **community project** and there is no official support for this package! Feel free to use it, open issues, contribute, and help answering questions.

The `cds-plugin-ui5` is a CAP server `cds-plugin` which enables the integration of UI5 tooling based (UI5 freestyle or Fiori elements) projects into the CAP server via the UI5 tooling express middlewares. The UI5 or Fiori elements projects just need to be located in the `app` folder of the CAP server or be dependency of the CAP server.

> :construction: **Note**
> This cds-plugin is still work in progress and not final yet!

## Prerequisites

The plugin requires [`@sap/cds`](https://www.npmjs.com/package/@sap/cds) `>=6.8.2`.

## Usage

Add a `devDependency` to the `cds-plugin-ui5` to your CAP server project:

```sh
npm add cds-plugin-ui5 -D
```

That's it!

## Info for UI5 Tooling Extension Developers

Custom middlewares may generate virtual app pages which should also be listed as web applications in the welcome page of the `@sap/cds` server. This is possible by assigning a static `getAppPages` function to the middleware function. The following snippet show-cases how this can be done:

```js
// the middleware factory function
module.exports = async ({ log, resources, options }) => {
  // create the middleware function
  const mwFn = (req, res, next) => {
    [...]
  };

  /**
   * Returns an array of app pages to be added to the welcome
   * page of the <code>@sap/cds</code> server.
   * @returns {undefined|string[]} array of app pages
   */
  mwFn.getAppPages = function() {
    return ["/test.html"];
  };

  // finally return the middleware function
  return mwFn;
};
```

The returned app pages will be added to the welcome page within the respective mount path.

## Support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this set of tooling extensions will be equally appreciated.

## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.
