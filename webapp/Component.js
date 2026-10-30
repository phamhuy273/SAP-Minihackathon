sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "./util/db",
  "./util/sql"
], function (UIComponent, JSONModel, MessageBox, db, SqlHelper) {
  "use strict";

  function loadDataJs() {
    return new Promise(function (resolve) {
      sap.ui.require(["workshop/dashboard/data"], function (fn) {
        resolve({ fn: fn });
      }, function (error) {
        resolve({ error: error });
      });
    });
  }

  return UIComponent.extend("workshop.dashboard.Component", {
    metadata: {
      manifest: "json",
      interfaces: ["sap.ui.core.IAsyncContentCreation"]
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      const dataModel = new JSONModel({});
      dataModel.setSizeLimit(5000);
      this.setModel(dataModel);
      this.setModel(new JSONModel({
        errors: [],
        logo: sap.ui.require.toUrl("sap/ui/core/mimes/logo/sap_50x26.png")
      }), "app");
      this.dataReady = Promise.all([db.load(), loadDataJs()]).then(this._load.bind(this));
      this.getRouter().initialize();
    },

    _load: function (results) {
      const loaded = results[0];
      const dataJs = results[1];
      const data = {};
      const errors = [];
      let queries = {};

      if (dataJs.error) {
        errors.push("data.js has a typo (" + dataJs.error.message + "). Check the commas and SQL template-literal backticks.");
      } else {
        const sql = function (query) { return { query: query, one: false }; };
        sql.one = function (query) { return { query: query, one: true }; };
        try {
          queries = dataJs.fn(sql) || {};
        } catch (error) {
          errors.push("data.js: " + error.message);
        }
      }

      Object.keys(queries).forEach(function (name) {
        const definition = queries[name];
        if (!definition || typeof definition.query !== "string") {
          data[name] = definition;
          return;
        }
        try {
          data[name] = definition.one ? loaded.sql.one(definition.query) : loaded.sql(definition.query);
          const badColumns = SqlHelper.badColumns(data[name]);
          if (badColumns.length) {
            errors.push(name + ": give " + badColumns.join(", ") + " a name with AS so it can be bound in XML.");
          }
        } catch (error) {
          errors.push(name + ": " + error.message);
        }
      });

      this.getModel().setData(data);
      this.getModel("app").setProperty("/errors", errors);
      if (errors.length) {
        this.rootControlLoaded().then(function () {
          setTimeout(function () {
            MessageBox.error("Some queries in webapp/data.js need a fix. The rest of the app still works.\n\n" + errors.join("\n\n"), {
              title: "data.js: " + errors.length + " problem" + (errors.length > 1 ? "s" : "")
            });
          }, 300);
        });
      }
      return data;
    }
  });
});
