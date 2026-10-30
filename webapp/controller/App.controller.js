sap.ui.define([
  "./BaseController"
], function (BaseController) {
  "use strict";

  return BaseController.extend("workshop.dashboard.controller.App", {
    onInit: function () {
      this.getRouter().attachRouteMatched(function (event) {
        const nav = this.byId("nav");
        if (nav && nav.setSelectedKey) {
          nav.setSelectedKey(event.getParameter("name"));
        }
      }, this);
    }
  });
});
