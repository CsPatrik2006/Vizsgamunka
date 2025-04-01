const Order = require("../model/orders");
const User = require("../model/users");
const Garage = require("../model/garages");
const OrderItem = require("../model/orderItems");
const Appointment = require("../model/appointments");
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
            where: { order_id: newOrder.id }
          });

          // Check if there's an appointment for this order
          const appointment = await Appointment.findOne({
            where: { order_id: newOrder.id }
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
            newOrder,
            orderItems,
            !!appointment,
            appointmentDetails
          );
        }, 2000); // Wait 2 seconds to ensure order items are created
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Continue with order creation even if email fails
      }
    })();

    res.status(201).json(newOrder);

    // No need to await this, let it run in the background
    emailPromise.catch(err => console.error("Background email sending failed:", err));

  } catch (error) {
    console.error("Error creating order:", error);
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

    // Check if status is changing
    const statusChanged = order.status !== status;
    const oldStatus = order.status;

    // Update the order
    await order.update({ user_id, garage_id, total_price, status });

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

    res.json(order);
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