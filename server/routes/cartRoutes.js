const express = require("express");
const router = express.Router();
const cartController = require("../Controller/cartController");

router.get("/", cartController.getAllCartItems);
router.get("/:id", cartController.getCartItemById);
router.post("/", cartController.createCartItem);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.deleteCartItem);

module.exports = router;
