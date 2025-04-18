const Cart = require("../model/cart");

exports.getAllCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.findAll();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCartItemById = async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createCartItem = async (req, res) => {
  try {
    const { user_id, garage_id } = req.body;

    if (!user_id || !garage_id) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id)" });
    }

    const newCartItem = await Cart.create({
      user_id,
      garage_id,
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { user_id, garage_id } = req.body;
    const cartItem = await Cart.findByPk(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.update({ user_id, garage_id });
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();
    res.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};