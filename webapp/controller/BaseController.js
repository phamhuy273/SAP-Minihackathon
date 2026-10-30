sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/viz/ui5/controls/VizFrame",
  "../util/formatter"
], function (Controller, VizFrame, formatter) {
  "use strict";

  return Controller.extend("workshop.dashboard.controller.BaseController", {
    formatter: formatter,

    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    onNavSelect: function (event) {
      const item = event.getParameter("item");
      const key = item && item.getKey ? item.getKey() : event.getParameter("key");
      if (this.getRouter().getRoute(key)) {
        this.getRouter().navTo(key);
      }
    },

    styleCharts: function (root) {
      if (!root) {
        return;
      }
      const charts = root instanceof VizFrame ? [root] : root.findAggregatedObjects(true, function (control) {
        return control instanceof VizFrame;
      });
      charts.forEach(function (chart) {
        if (chart.data("styled")) {
          return;
        }
        chart.data("styled", true);
        const type = chart.getVizType();
        const isTrend = /line|combination|column/.test(type);
        const isPie = /pie|donut/.test(type);
        chart.setVizProperties({
          title: { visible: false },
          legend: { visible: true },
          legendGroup: { layout: { position: "bottom" } },
          plotArea: {
            dataLabel: { visible: !isTrend, type: isPie ? "percentage" : "value" },
            adjustScale: /line|combination/.test(type),
            window: { start: "firstDataPoint", end: "lastDataPoint" }
          },
          valueAxis: { title: { visible: false } },
          categoryAxis: { title: { visible: false } },
          interaction: { selectability: { mode: "SINGLE" } }
        });
      });
    }
  });
});
