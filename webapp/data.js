sap.ui.define([], function () {
  "use strict";

  /*
   * Every entry becomes a path that can be bound in an XML view:
   *
   *   name: sql(`SELECT …`)       many rows → items="{/name}" or data="{/name}"
   *   name: sql.one(`SELECT …`)   one row  → {/name/column}
   *
   * Develop the query in the deployed Query Playground, paste it between
   * the markers below, save, and refresh this app.
   * Name calculated columns with AS so they can be bound in XML.
   */
  return function (sql) {
    return {
      membersByClub: sql(`
        SELECT name, members
        FROM clubs
        ORDER BY members DESC
      `),

      // 🧩 YOUR QUERIES START

      // 🧩 YOUR QUERIES END
    };
  };
});
