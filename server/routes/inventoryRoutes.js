const express = require("express");
const router = express.Router();
const inventoryController = require("../Controller/inventoryController");
const upload = require("../middleware/uploadMiddleware");

router.get("/", inventoryController.getAllItems);

router.get("/garage/:garageId", inventoryController.getItemsByGarageId);

router.get("/:id", inventoryController.getItemById);

router.post("/", upload.fields([
  { name: 'cover_img', maxCount: 1 },
  { name: 'additional_img1', maxCount: 1 },
  { name: 'additional_img2', maxCount: 1 }
]), inventoryController.createItem);

router.put("/:id", upload.fields([
  { name: 'cover_img', maxCount: 1 },
  { name: 'additional_img1', maxCount: 1 },
  { name: 'additional_img2', maxCount: 1 }
]), inventoryController.updateItem);

router.patch("/:id/quantity", inventoryController.updateItemQuantity);

router.delete("/:id", inventoryController.deleteItem);

module.exports = router;