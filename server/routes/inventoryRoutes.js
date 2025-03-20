const express = require("express");
const router = express.Router();
const inventoryController = require("../Controller/inventoryController");
const upload = require("../middleware/uploadMiddleware");

router.get("/", inventoryController.getAllItems);
router.get("/:id", inventoryController.getItemById);
router.post("/", upload.single('image'), inventoryController.createItem);
router.put("/:id", upload.single('image'), inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);
module.exports = router;