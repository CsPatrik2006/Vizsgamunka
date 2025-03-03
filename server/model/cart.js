const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../model/users");
const Garage = require("../model/garages");

const Cart = sequelize.define(
  "Cart",
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
  },
  {
    tableName: "cart",
    timestamps: true,
  }
);

module.exports = Cart;