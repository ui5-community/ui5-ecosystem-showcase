sap.ui.define(
	["ui5/ecosystem/demo/app/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/ui/core/ws/WebSocket"],
	(Controller, JSONModel, MessageToast, WebSocket) => {
		"use strict";

		const wsMap = new Map();
		const createWebSocket = function (wsUrl, onMessage, onError) {
			return (
				wsMap.get(wsUrl) ||
				wsMap
					.set(
						wsUrl,
						new Promise(function (res, rej) {
							const ws = new WebSocket(wsUrl);
							ws.attachOpen(
								function (event) {
									// give the socket connection some time to be setup
									setTimeout(function () {
										res([ws, event.getParameter("data")]);
									}, 100);
								}.bind(ws)
							);
							ws.attachMessage(
								(
									(typeof onMessage === "function" && onMessage) ||
									function (event) {
										MessageToast.show(`ℹ [WS] Server responded: ${event.getParameter("data")}`);
									}
								).bind(ws)
							);
							ws.attachError(
								(
									(typeof onError === "function" && onError) ||
									function (event) {
										rej([this, event.getParameter("data")]);
									}
								).bind(ws)
							);
							ws.attachClose(function (event) {
								const { data, code, reason } = event.getParameters();
								if (event.wasClean) {
									MessageToast.show(`ℹ [WS] Connection closed (code=${code} reason=${reason})`);
								} else {
									MessageToast.show(`⚠️ [WS] Connection died! Reason: ${data}`);
								}
							});
						})
					)
					.get(wsUrl)
			);
		};

		return Controller.extend("ui5.ecosystem.demo.app.controller.Main", {
			async onInit() {
				var versionModel = new JSONModel();
				this.getView().setModel(versionModel, "UI5Version");

				sap.ui.getVersionInfo({ async: true }).then((versionInfo) => {
					versionModel.setData({
						current: versionInfo.libraries.find((lib) => lib.name === "sap.ui.core"),
					});
				});

				try {
					const indexResponse = await fetch("docs/index.md");
					const indexContent = await indexResponse.text();
					this.byId("doc").setValue(indexContent);
				} catch (err) {
					console.error(err);
				}

				try {
					const helloResponse = await fetch("/proxy/local/hello.txt");
					const helloContent = await helloResponse.text();
					console.log("simpleproxy", "local", helloContent);
				} catch (err) {
					console.error(err);
				}

				try {
					const webcResponse = await fetch("/sst/@ui5/webcomponents-icons/v5/SAP-icons.json");
					const webcContent = await webcResponse.json();
					console.log("servestatic", "@ui5/webcomponents-icons", webcContent);
				} catch (err) {
					console.error(err);
				}

				try {
					const tuiResponse = await fetch("/sst/tui-image-editor/icon-a.svg");
					const tuiContent = await tuiResponse.text();
					console.log("servestatic", "tui-image-editor", tuiContent.substring(0, 50) + "...");
				} catch (err) {
					console.error(err);
				}
			},

			navTo: function (route) {
				return this.getOwnerComponent().getRouter().navTo(route);
			},

			onPress(oEvent) {
				MessageToast.show(`${oEvent.getSource().getId()} pressed`);
			},
			onBoo() {
				MessageToast.show(`👻`);
			},

			async testWebSocket() {
				const ws = (await createWebSocket(`ws${location.protocol === "https:" ? "s" : ""}://${location.host}/wsecho`))?.[0];
				if (ws) {
					ws.send("Hello ui5-middleware-websocket! 👋");
				}
			},
			async testWebSocketSP() {
				const ws = (await createWebSocket(`ws${location.protocol === "https:" ? "s" : ""}://${location.host}/spwsecho`))?.[0];
				if (ws) {
					ws.send("Hello ui5-middleware-simpleproxy! 👋");
				}
			},
			async testWebSocketCF() {
				const ws = (await createWebSocket(`ws${location.protocol === "https:" ? "s" : ""}://${location.host}/cfwsecho`))?.[0];
				if (ws) {
					ws.send("Hello ui5-middleware-approuter! 👋");
				}
			},
		});
	}
);
