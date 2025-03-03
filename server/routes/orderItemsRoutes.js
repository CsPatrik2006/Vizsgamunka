const express = require("express");
const router = express.Router();
const orderItemsController = require("../Controller/orderItemsController");

router.get("/", orderItemsController.getAllOrderItems);
router.get("/:id", orderItemsController.getOrderItemById);
router.post("/", orderItemsController.createOrderItem);
router.put("/:id", orderItemsController.updateOrderItem);
router.delete("/:id", orderItemsController.deleteOrderItem);

module.exports = router;