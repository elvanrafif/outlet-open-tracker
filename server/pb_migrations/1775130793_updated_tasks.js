/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "date3085373714",
    "max": "",
    "min": "",
    "name": "lastEditedAt",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation4199212436",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "LastEditedBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // remove field
  collection.fields.removeById("date3085373714")

  // remove field
  collection.fields.removeById("relation4199212436")

  return app.save(collection)
})
