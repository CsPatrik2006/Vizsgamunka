const { Sequelize } = require("sequelize");


const sequelize = new Sequelize("root", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false, 
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();

module.exports = sequelize;
