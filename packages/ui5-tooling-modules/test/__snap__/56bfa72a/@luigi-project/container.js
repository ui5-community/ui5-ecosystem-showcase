/*!
 * ${copyright}
 */
sap.ui.define([
	"ui5/ecosystem/demo/tsapp/resources/container",
], function(
	WebCPackage,
) {
  "use strict";

  const pkg = {
    "_ui5metadata":
{
  "name": "@luigi-project/container",
  "version": "1.6.0-dev.20250430700",
  "dependencies": [
    "sap.ui.core"
  ],
  "types": [],
  "interfaces": [],
  "controls": [
    "@luigi-project/container.LuigiContainer",
    "@luigi-project/container.LuigiCompoundContainer"
  ],
  "elements": [],
  "rootPath": "ui5/ecosystem/demo/tsapp/resources/"
}
  };

	if (WebCPackage) {
		Object.keys(WebCPackage).forEach((key) => {
			if (key !== "default") {
				pkg[key] = WebCPackage[key];
			} else {
				if (typeof WebCPackage[key] === "object") {
					Object.assign(pkg, WebCPackage[key]);
				}
			}
		});
	}



	return pkg;
});
