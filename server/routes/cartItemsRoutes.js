const express = require("express");
const router = express.Router();
const cartItemsController = require("../Controller/cartItemsController");

router.get("/", cartItemsController.getAllCartItems);
router.get("/:id", cartItemsController.getCartItemById);
router.post("/", cartItemsController.createCartItem);
router.put("/:id", cartItemsController.updateCartItem);
router.delete("/:id", cartItemsController.deleteCartItem);

module.exports = router;
