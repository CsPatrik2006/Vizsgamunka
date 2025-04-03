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

// Create a new inventory item with multiple images
router.post("/", upload.fields([
  { name: 'cover_img', maxCount: 1 },
  { name: 'additional_img1', maxCount: 1 },
  { name: 'additional_img2', maxCount: 1 }
]), inventoryController.createItem);

// Update an existing inventory item with multiple images
router.put("/:id", upload.fields([
  { name: 'cover_img', maxCount: 1 },
  { name: 'additional_img1', maxCount: 1 },
  { name: 'additional_img2', maxCount: 1 }
]), inventoryController.updateItem);

// Update only the quantity of an inventory item
router.patch("/:id/quantity", inventoryController.updateItemQuantity);

// Delete an inventory item
router.delete("/:id", inventoryController.deleteItem);

module.exports = router;