const CartItem = require("../model/cartItems");

// Get all cart items
exports.getAllCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a cart item by ID
exports.getCartItemById = async (req, res) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new cart item
exports.createCartItem = async (req, res) => {
  try {
    const { cart_id, product_type, product_id, quantity } = req.body;

    if (!cart_id || !product_type || !product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCartItem = await CartItem.create({
      cart_id,
      product_type,
      product_id,
      quantity,
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { cart_id, product_type, product_id, quantity } = req.body;
    const cartItem = await CartItem.findByPk(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.update({ cart_id, product_type, product_id, quantity });
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a cart item
exports.deleteCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();
    res.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};