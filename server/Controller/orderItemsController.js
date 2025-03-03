const OrderItem = require("../model/orderItems");

// Get all order items
exports.getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll();
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get an order item by ID
exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new order item
exports.createOrderItem = async (req, res) => {
  try {
    const { order_id, product_type, product_id, quantity, unit_price } = req.body;

    if (!order_id || !product_type || !product_id || !quantity || !unit_price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrderItem = await OrderItem.create({
      order_id,
      product_type,
      product_id,
      quantity,
      unit_price,
    });

    res.status(201).json(newOrderItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing order item
exports.updateOrderItem = async (req, res) => {
  try {
    const { order_id, product_type, product_id, quantity, unit_price } = req.body;
    const orderItem = await OrderItem.findByPk(req.params.id);

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await orderItem.update({ order_id, product_type, product_id, quantity, unit_price });
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an order item
exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await orderItem.destroy();
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};