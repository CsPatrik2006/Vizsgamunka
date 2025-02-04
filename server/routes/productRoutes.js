const express = require("express");
const router = express.Router();
const inventoryController = require("../Controller/inventoryController");

router.get("/", inventoryController.getAllItems);
router.get("/:id", inventoryController.getItemById);
router.post("/", inventoryController.createItem);

module.exports = router;