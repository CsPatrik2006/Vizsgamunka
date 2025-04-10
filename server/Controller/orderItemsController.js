const OrderItem = require("../model/orderItems");
const Inventory = require("../model/inventory");

exports.getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll();
    res.json(orderItems);
  } catch (error) {
    console.error("Error fetching all order items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }
    res.json(orderItem);
  } catch (error) {
    console.error("Error fetching order item by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderItemsByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId }
    });

    const enhancedOrderItems = await Promise.all(orderItems.map(async (item) => {
      const itemData = item.toJSON();

      const product = await Inventory.findByPk(item.product_id);
      if (product) {
        itemData.product_name = product.item_name;
        itemData.product_details = product;
      } else {
        itemData.product_name = 'Ismeretlen termék';
      }

      return itemData;
    }));

    res.json(enhancedOrderItems);
  } catch (error) {
    console.error("Error fetching order items by order ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity, unit_price } = req.body;

    if (!order_id || !product_id || !quantity || !unit_price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrderItem = await OrderItem.create({
      order_id,
      product_type: "inventory",
      product_id,
      quantity,
      unit_price,
    });

    res.status(201).json(newOrderItem);
  } catch (error) {
    console.error("Error creating order item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity, unit_price } = req.body;
    const orderItem = await OrderItem.findByPk(req.params.id);

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await orderItem.update({
      order_id,
      product_type: "inventory",
      product_id,
      quantity,
      unit_price
    });

    res.json(orderItem);
  } catch (error) {
    console.error("Error updating order item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await orderItem.destroy();
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    console.error("Error deleting order item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};