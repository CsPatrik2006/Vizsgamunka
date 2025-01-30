const express = require("express");
const sequelize = require("./config/config");
const productRoutes = require("./routes/productRoutes");
const partnerRoutes = require("./routes/partnerRoutes");


const app = express();
app.use(express.json());

app.use("/products", productRoutes);
app.use("/partners", partnerRoutes);



sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully."))
  .catch((err) => console.error("Error syncing database:", err));

app.listen(3000, () => console.log("Server running on port 3000"));
