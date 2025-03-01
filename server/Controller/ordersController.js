const Order = require("../model/orders");
const User = require("../model/users");
const Garage = require("../model/garages");

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ["id", "user_id", "garage_id", "total_price", "order_date", "status"],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"], // Include user details (customize as needed)
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"], // Include garage details (customize as needed)
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"], // Include user details (customize as needed)
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"], // Include garage details (customize as needed)
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { user_id, garage_id, total_price, status } = req.body;

    if (!user_id || !garage_id || !total_price || !status) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, total_price, status)" });
    }

    const newOrder = await Order.create({
      user_id,
      garage_id,
      total_price,
      status,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing order
exports.updateOrder = async (req, res) => {
  try {
    const { user_id, garage_id, total_price, status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ user_id, garage_id, total_price, status });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.destroy();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
