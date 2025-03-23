const express = require("express");
const router = express.Router();
const inventoryController = require("../Controller/inventoryController");
const upload = require("../middleware/uploadMiddleware");

// Get all inventory items with filtering
router.get("/", inventoryController.getAllItems);

// Get inventory items by garage ID
router.get("/garage/:garageId", inventoryController.getItemsByGarageId);

// Get a specific inventory item by ID
router.get("/:id", inventoryController.getItemById);

// Create a new inventory item
router.post("/", upload.single('image'), inventoryController.createItem);

// Update an existing inventory item
router.put("/:id", upload.single('image'), inventoryController.updateItem);

// Update only the quantity of an inventory item
router.patch("/:id/quantity", inventoryController.updateItemQuantity);

// Delete an inventory item
router.delete("/:id", inventoryController.deleteItem);

module.exports = router;