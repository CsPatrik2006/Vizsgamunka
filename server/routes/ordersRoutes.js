const express = require("express");
const router = express.Router();
const ordersController = require("../Controller/ordersController");

router.get("/", ordersController.getAllOrders);
router.get("/garage/:garageId", ordersController.getOrdersByGarageId);
router.get("/user/:userId", ordersController.getOrdersByUserId);
router.get("/:id", ordersController.getOrderById);
router.post("/", ordersController.createOrder);
router.put("/:id", ordersController.updateOrder);
router.delete("/:id", ordersController.deleteOrder);

module.exports = router;