const Order = require("../model/orders");
const User = require("../model/users");
const Garage = require("../model/garages");
const OrderItem = require("../model/orderItems");
const Appointment = require("../model/appointments");
const Inventory = require("../model/inventory");
const Service = require("../model/services");
const sequelize = require("../config/config");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../utils/emailService");

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ["id", "user_id", "garage_id", "total_price", "order_date", "status"],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"], // Include user details
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"], // Include garage details
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
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
          attributes: ["id", "name", "email"], // Include user details
        },
        {
          model: Garage,
          attributes: ["id", "name", "location"], // Include garage details
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

// Get orders by garage ID
exports.getOrdersByGarageId = async (req, res) => {
  try {
    const garageId = req.params.garageId;

    // First check if the garage exists
    const garage = await Garage.findByPk(garageId);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    // Try with a simpler query first
    const orders = await Order.findAll({
      where: { garage_id: garageId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone"],
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

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { user_id, garage_id, total_price, status, items } = req.body;

    if (!user_id || !garage_id || !total_price || !status) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, total_price, status)" });
    }

    console.log("Creating order with items:", JSON.stringify(items, null, 2));

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Create the order
      const newOrder = await Order.create({
        user_id,
        garage_id,
        total_price,
        status,
      }, { transaction: t });

      console.log(`Order created with ID: ${newOrder.id}`);

      // If items are provided in the request, process them
      if (items && Array.isArray(items)) {
        console.log(`Processing ${items.length} items for order ${newOrder.id}`);

        for (const item of items) {
          console.log(`Processing item: ${JSON.stringify(item)}`);

          // Create order item
          const orderItem = await OrderItem.create({
            order_id: newOrder.id,
            product_type: item.product_type,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }, { transaction: t });

          console.log(`Created order item with ID: ${orderItem.id}`);

          // Update inventory if the item is an inventory product
          if (item.product_type === 'inventory') {
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

            // Subtract the ordered quantity from inventory
            await inventoryItem.update({
              quantity: newQuantity
            }, { transaction: t });

            console.log(`Successfully updated inventory for item ${item.product_id}`);
          } else {
            console.log(`Item ${item.product_id} is type ${item.product_type}, no inventory update needed`);
          }
        }
      } else {
        console.log(`No items provided for order ${newOrder.id}`);
      }

      return newOrder;
    });

    console.log(`Order transaction completed successfully for order ID: ${result.id}`);

    // Get user information for the email
    const user = await User.findByPk(user_id);

    // Get garage information
    const garage = await Garage.findByPk(garage_id);

    // Send order confirmation email (we'll get order items later)
    // We'll store this promise to await it after responding to the client
    const emailPromise = (async () => {
      try {
        // Wait a bit to allow order items to be created
        setTimeout(async () => {
          // Get order items
          const orderItems = await OrderItem.findAll({
            where: { order_id: result.id }
          });

          // Enhance order items with product details
          const enhancedOrderItems = await Promise.all(orderItems.map(async (item) => {
            const itemData = item.toJSON();

            // Get product details based on product_type
            if (item.product_type === 'inventory') {
              const product = await Inventory.findByPk(item.product_id);
              if (product) {
                // Use item_name from inventory
                itemData.product_name = product.item_name;
              }
            } else if (item.product_type === 'service') {
              const service = await Service.findByPk(item.product_id);
              if (service) {
                // Use name from services
                itemData.product_name = service.name;
              }
            }

            return itemData;
          }));

          // Check if there's an appointment for this order
          const appointment = await Appointment.findOne({
            where: { order_id: result.id }
          });

          let appointmentDetails = null;
          if (appointment) {
            // Get garage name for the appointment
            const appointmentGarage = await Garage.findByPk(appointment.garage_id);
            appointmentDetails = {
              ...appointment.dataValues,
              garage_name: appointmentGarage ? appointmentGarage.name : 'Unknown'
            };
          }

          await sendOrderConfirmationEmail(
            user,
            result,
            enhancedOrderItems, // Use enhanced items with product names
            !!appointment,
            appointmentDetails
          );
        }, 2000); // Wait 2 seconds to ensure order items are created
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Continue with order creation even if email fails
      }
    })();

    res.status(201).json(result);

    // No need to await this, let it run in the background
    emailPromise.catch(err => console.error("Background email sending failed:", err));

  } catch (error) {
    console.error("Error creating order:", error);

    // Provide more specific error messages for inventory-related issues
    if (error.message.includes("Not enough stock")) {
      return res.status(400).json({ message: error.message });
    }

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

    // Check if status is changing to canceled
    const statusChangingToCanceled = order.status !== 'canceled' && status === 'canceled';

    // Check if status is changing
    const statusChanged = order.status !== status;
    const oldStatus = order.status;

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Update the order
      await order.update({ user_id, garage_id, total_price, status }, { transaction: t });

      // If order is being canceled, restore inventory quantities
      if (statusChangingToCanceled) {
        console.log(`Order #${order.id} is being canceled. Restoring inventory...`);

        // Get order items
        const orderItems = await OrderItem.findAll({
          where: { order_id: order.id },
          transaction: t
        });

        // Process each order item
        for (const item of orderItems) {
          // Only restore inventory for inventory items
          if (item.product_type === 'inventory') {
            const inventoryItem = await Inventory.findByPk(item.product_id, { transaction: t });

            if (inventoryItem) {
              console.log(`Restoring ${item.quantity} units to inventory item #${item.product_id}`);

              // Add the ordered quantity back to inventory
              await inventoryItem.update({
                quantity: inventoryItem.quantity + item.quantity
              }, { transaction: t });

              console.log(`Inventory item #${item.product_id} updated. New quantity: ${inventoryItem.quantity + item.quantity}`);
            } else {
              console.warn(`Inventory item #${item.product_id} not found. Cannot restore quantity.`);
            }
          }
        }
      }

      return order;
    });

    // If status changed, send notification email
    if (statusChanged && ['confirmed', 'completed', 'canceled'].includes(status)) {
      try {
        // Get user information
        const user = await User.findByPk(order.user_id);

        // Get garage information
        const garage = await Garage.findByPk(order.garage_id);

        // Send status update email
        await sendOrderStatusUpdateEmail(user, order, garage, {
          oldStatus,
          newStatus: status
        });

        console.log(`Status update email sent for order #${order.id}: ${oldStatus} -> ${status}`);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Continue with order update even if email fails
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
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
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};