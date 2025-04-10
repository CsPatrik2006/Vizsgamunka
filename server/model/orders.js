const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../model/users");
const Garage = require("../model/garages");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    garage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Garage,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled'),
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

Order.belongsTo(User, { foreignKey: 'user_id' });
Order.belongsTo(Garage, { foreignKey: 'garage_id' });

module.exports = Order;