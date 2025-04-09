require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require('path');
const sequelize = require("./config/config");
const inventoryRoutes = require("./routes/inventoryRoutes");
const usersRoutes = require("./routes/usersRoutes");
const garagesRoutes = require("./routes/garagesRoutes");
const appointmentsRoutes = require("./routes/appointmentsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const cartRoutes = require("./routes/cartRoutes");
const cartItemsRoutes = require("./routes/cartItemsRoutes");
const orderItemsRoutes = require("./routes/orderItemsRoutes");

// Check email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('Warning: Email credentials not configured. Email notifications will not work.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/images', express.static('images'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/inventory", inventoryRoutes);
app.use("/users", usersRoutes);
app.use("/garages", garagesRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/api/", usersRoutes);
app.use("/orders", ordersRoutes);
app.use("/cart", cartRoutes);
app.use("/cartItems", cartItemsRoutes);
app.use("/orderItems", orderItemsRoutes);

sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully."))
  .catch((err) => console.error("Error syncing database:", err));

app.listen(3000, () => console.log("Server running on port 3000"));