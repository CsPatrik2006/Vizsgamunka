const express = require("express");
const router = express.Router();
const inventoryController = require("../Controller/inventoryController");

router.get("/", inventoryController.getAllItems);
router.get("/:id", inventoryController.getItemById);
router.post("/", inventoryController.createItem);
router.put("/:id", inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);

module.exports = router;