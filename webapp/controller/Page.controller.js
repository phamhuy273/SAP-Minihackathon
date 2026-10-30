sap.ui.define([
  "./BaseController"
], function (BaseController) {
  "use strict";

  /**
   * Shared controller for Page1, Page2 and Page3.
   * Add optional formatters and event handlers here.
   */
  return BaseController.extend("workshop.dashboard.controller.Page", {
    onInit: function () {
      this.styleCharts(this.getView());
    }
  });
});
