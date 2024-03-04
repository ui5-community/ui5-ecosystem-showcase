sap.ui.define(["sap/ui/core/mvc/XMLView", "./createWebComponent"], function (XMLView, createWebComponent) {
	"use strict";

	XMLView.registerPreprocessor(
		"xml",
		function (vSource, sCaller, mSettings) {
			return new Promise(function (resolve) {
				const imports = [];
				[...vSource.attributes]
					.filter((attr) => attr.nodeName.indexOf("xmlns") === 0)
					.forEach((attr) => {
						const xmlns = attr.nodeName.substr("xmlns:".length);
						const xmlnsImport = vSource.getAttribute(`${xmlns ? xmlns + ":" : ""}import`);
						if (xmlnsImport) {
							imports.push([
								xmlns, // xmlNamespace
								attr.nodeValue, // ui5Namespace
								xmlnsImport, // modulePath
							]);
						}
						vSource.removeAttribute(`${xmlns ? xmlns + ":" : ""}import`);
					});

				Promise.all(
					imports.map(([xmlNamespace, ui5Namespace, modulePath]) => {
						const matches = [...vSource.innerHTML.matchAll(new RegExp(`\\<${xmlNamespace}\\:([a-z0-9]+)`, "gi"))];
						const uniqueWebCs = matches
							.map((entry) => entry[1])
							.filter(function (item, pos, arr) {
								return /[A-Z]/.test(item[0]) && arr.indexOf(item) == pos;
							});
						if (uniqueWebCs.length > 0) {
							return new Promise(function (resolve, reject) {
								const deps = uniqueWebCs.map((webc) => `${modulePath}/${webc}`);
								sap.ui.require(deps, function () {
									for (const i in arguments) {
										const WebComponentClass = arguments[i];
										const name = uniqueWebCs[i]; // WebComponentClass.name will be minified!
										if (!sap.ui.require(`${ui5Namespace.replace(/\./g, "/")}/${name}`)) {
											// eslint-disable-next-line max-nested-callbacks
											sap.ui.define(`${ui5Namespace.replace(/\./g, "/")}/${name}`, [], function () {
												return createWebComponent(WebComponentClass, {
													namespace: ui5Namespace,
												});
											});
										}
									}
									resolve();
								});
							});
						} else {
							return Promise.resolve();
						}
					})
				).then(() => {
					resolve(vSource);
				});
			});
		},
		false /* sync support */,
		{
			// mSettings
		}
	);
});
