/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1710221993")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"superadmin\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1710221993")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": "",
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
