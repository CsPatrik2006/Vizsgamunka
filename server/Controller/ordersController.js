const Order = require("../model/orders");
const User = require("../model/users");
const Garage = require("../model/garages");
const OrderItem = require("../model/orderItems");
const Appointment = require("../model/appointments");
const Inventory = require("../model/inventory");
const sequelize = require("../config/config");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../utils/emailService");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ["id", "user_id", "garage_id", "total_price", "order_date", "status"],
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrdersByGarageId = async (req, res) => {
  try {
    const garageId = req.params.garageId;

    const garage = await Garage.findByPk(garageId);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    const orders = await Order.findAll({
      where: { garage_id: garageId },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        },
      ],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by garage ID:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { user_id, garage_id, total_price, status, items } = req.body;

    if (!user_id || !garage_id || !total_price || !status) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, total_price, status)" });
    }

    console.log("Creating order with items:", JSON.stringify(items, null, 2));

    const result = await sequelize.transaction(async (t) => {
      const newOrder = await Order.create({
        user_id,
        garage_id,
        total_price,
        status,
      }, { transaction: t });

      console.log(`Order created with ID: ${newOrder.id}`);

      if (items && Array.isArray(items)) {
        console.log(`Processing ${items.length} items for order ${newOrder.id}`);

        for (const item of items) {
          console.log(`Processing item: ${JSON.stringify(item)}`);

          const orderItem = await OrderItem.create({
            order_id: newOrder.id,
            product_type: "inventory",
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }, { transaction: t });

          console.log(`Created order item with ID: ${orderItem.id}`);

          console.log(`Item ${item.product_id} is inventory type, updating stock...`);

          const inventoryItem = await Inventory.findByPk(item.product_id, { transaction: t });

          if (!inventoryItem) {
            console.error(`Inventory item with ID ${item.product_id} not found`);
            throw new Error(`Inventory item with ID ${item.product_id} not found`);
          }

          console.log(`Found inventory item: ${inventoryItem.item_name}, current quantity: ${inventoryItem.quantity}`);

          if (inventoryItem.quantity < item.quantity) {
            console.error(`Not enough stock for item ${inventoryItem.item_name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
            throw new Error(`Not enough stock for item ${inventoryItem.item_name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
          }

          const newQuantity = inventoryItem.quantity - item.quantity;
          console.log(`Updating quantity from ${inventoryItem.quantity} to ${newQuantity}`);

          await inventoryItem.update({
            quantity: newQuantity
          }, { transaction: t });

          console.log(`Successfully updated inventory for item ${item.product_id}`);
        }
      } else {
        console.log(`No items provided for order ${newOrder.id}`);
      }

      return newOrder;
    });

    console.log(`Order transaction completed successfully for order ID: ${result.id}`);

    const user = await User.findByPk(user_id);

    const garage = await Garage.findByPk(garage_id);

    const emailPromise = (async () => {
      try {
        setTimeout(async () => {
          const orderItems = await OrderItem.findAll({
            where: { order_id: result.id }
          });

          const enhancedOrderItems = await Promise.all(orderItems.map(async (item) => {
            const itemData = item.toJSON();

            const product = await Inventory.findByPk(item.product_id);
            if (product) {
              itemData.product_name = product.item_name;
            } else {
              itemData.product_name = 'Ismeretlen termék';
            }

            return itemData;
          }));

          const appointment = await Appointment.findOne({
            where: { order_id: result.id }
          });

          let appointmentDetails = null;
          if (appointment) {
            const appointmentGarage = await Garage.findByPk(appointment.garage_id);
            appointmentDetails = {
              ...appointment.dataValues,
              garage_name: appointmentGarage ? appointmentGarage.name : 'Unknown'
            };
          }

          await sendOrderConfirmationEmail(
            user,
            result,
            enhancedOrderItems,
            !!appointment,
            appointmentDetails
          );
        }, 2000);
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }
    })();

    res.status(201).json(result);

    emailPromise.catch(err => console.error("Background email sending failed:", err));

  } catch (error) {
    console.error("Error creating order:", error);

    if (error.message.includes("Not enough stock")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { user_id, garage_id, total_price, status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const statusChangingToCanceled = order.status !== 'canceled' && status === 'canceled';

    const statusChanged = order.status !== status;
    const oldStatus = order.status;

    const result = await sequelize.transaction(async (t) => {
      await order.update({ user_id, garage_id, total_price, status }, { transaction: t });

      if (statusChangingToCanceled) {
        console.log(`Order #${order.id} is being canceled. Restoring inventory...`);

        const orderItems = await OrderItem.findAll({
          where: { order_id: order.id },
          transaction: t
        });

        for (const item of orderItems) {
          const inventoryItem = await Inventory.findByPk(item.product_id, { transaction: t });

          if (inventoryItem) {
            console.log(`Restoring ${item.quantity} units to inventory item #${item.product_id}`);

            await inventoryItem.update({
              quantity: inventoryItem.quantity + item.quantity
            }, { transaction: t });

            console.log(`Inventory item #${item.product_id} updated. New quantity: ${inventoryItem.quantity + item.quantity}`);
          } else {
            console.warn(`Inventory item #${item.product_id} not found. Cannot restore quantity.`);
          }
        }
      }

      return order;
    });

    if (statusChanged && ['confirmed', 'completed', 'canceled'].includes(status)) {
      try {
        const user = await User.findByPk(order.user_id);

        const garage = await Garage.findByPk(order.garage_id);

        await sendOrderStatusUpdateEmail(user, order, garage, {
          oldStatus,
          newStatus: status
        });

        console.log(`Status update email sent for order #${order.id}: ${oldStatus} -> ${status}`);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.destroy();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Unauthorized access to another user's orders" });
    }

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        },
      ],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by user ID:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};