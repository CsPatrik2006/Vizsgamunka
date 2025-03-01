const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../model/users");
const Garage = require("../model/garages");

const Appointments = sequelize.define(
  "Appointments",
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
        model: User, // Reference the 'users' table
        key: "id", // The primary key in the 'users' table
      },
      onDelete: "CASCADE", // Ensure deletion of appointments if user is deleted
    },
    garage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Garage, // Reference the 'garages' table
        key: "id", // The primary key in the 'garages' table
      },
      onDelete: "CASCADE", // Ensure deletion of appointments if garage is deleted
    },
    appointment_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "canceled"),
      allowNull: false,
      defaultValue: "pending",
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders", // Reference the 'orders' table
        key: "id", // The primary key in the 'orders' table
      },
      onDelete: "CASCADE", // Ensure deletion of appointments if order is deleted
    },
  },
  {
    tableName: "appointments", // Changed the table name to 'appointments'
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

module.exports = Appointments;
