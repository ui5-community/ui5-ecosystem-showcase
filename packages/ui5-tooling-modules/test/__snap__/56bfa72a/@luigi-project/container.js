/*!
 * ${copyright}
 */
sap.ui.define(["../container"], function (WebCPackage) {
  "use strict";

  // re-export package object
  const pkg = Object.assign({}, WebCPackage);

  // export the UI5 metadata along with the package
  pkg["_ui5metadata"] = {
    name: "@luigi-project/container",
    version: "1.7.0",
    dependencies: ["sap.ui.core"],
    types: [],
    interfaces: [],
    controls: [
      "@luigi-project.container.LuigiContainer",
      "@luigi-project.container.LuigiCompoundContainer"
    ],
    elements: [],
    rootPath: "../"
  };

  // Enums

  // Interfaces

  // marker to threat this as an ES module to support named exports
  pkg.__esModule = true;

  return pkg;
});
