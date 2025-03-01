const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../model/users");

const Garage = sequelize.define(
  "Garage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_info: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "garages",
    timestamps: true,
  }
);

module.exports = Garage;
