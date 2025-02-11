const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Szolgaltatasok = sequelize.define(
  "Szolgaltatasok",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    garage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "szolgaltatasok",
    timestamps: true,
  }
);

module.exports = Szolgaltatasok;
