sap.ui.define(["sap/ui/core/Control", "chart.js/auto", "sap/ui/dom/includeStylesheet"], function (Control, Chart, includeStylesheet) {
	return Control.extend("ui5-app-module.Chart", {
		metadata: {
			properties: {
				title: "string",
				color: "sap.ui.core.CSSColor",
			},
			aggregations: {
				records: {
					type: "ui5-app-module.ChartRecord",
				},
			},
			defaultAggregation: "records",
		},
		renderer: {
			apiVersion: 2,
			render: function (rm, chart) {
				rm.openStart("div", chart);
				rm.style("color", chart.getColor());
				rm.class("chart");
				rm.openEnd();

				rm.openStart("canvas", chart.getId() + "-canvas");
				rm.openEnd();
				rm.close("canvas");

				rm.close("div");
			},
		},
		_getChartData: function () {
			const aRecords = this.getRecords();
			return {
				labels: aRecords.map((record) => {
					return record.getLabel();
				}),
				datasets: [
					{
						label: this.getTitle(),
						backgroundColor: this.getColor(),
						borderColor: this.getColor(),
						data: aRecords.map((record) => {
							return record.getValue();
						}),
					},
				],
			};
		},
		init: function () {
			includeStylesheet(sap.ui.require.toUrl("ui5-app-module/Chart.css"));
		},
		onAfterRendering: function () {
			if (!this._chart) {
				this._chart = new Chart(this.getDomRef("canvas"), {
					type: "line",
					data: this._getChartData(),
					options: {
						responsive: true,
					},
				});
			} else {
				this._chart.data = this._getChartData();
				this._chart.update();
			}
		},
	});
});
