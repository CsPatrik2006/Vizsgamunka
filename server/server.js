const express = require("express");
const sequelize = require("./config/config");
const inventoryRoutes = require("./routes/inventoryRoutes");
const usersRoutes = require("./routes/usersRoutes");
const garagesRoutes = require("./routes/garagesRoutes");
const work_ordersRoutes = require("./routes/work_ordersRoutes");


const app = express();
app.use(express.json());

app.use("/inventory", inventoryRoutes);
app.use("/users", usersRoutes);
app.use("/garages", garagesRoutes);
app.use("/work_orders", work_ordersRoutes);
//app.use("/")



sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully."))
  .catch((err) => console.error("Error syncing database:", err));

app.listen(3000, () => console.log("Server running on port 3000"));
