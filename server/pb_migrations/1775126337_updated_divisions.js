/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1710221993")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"superadmin\"",
    "updateRule": "@request.auth.role = \"superadmin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1710221993")

  // update collection data
  unmarshal({
    "deleteRule": null,
    "updateRule": ""
  }, collection)

  return app.save(collection)
})
