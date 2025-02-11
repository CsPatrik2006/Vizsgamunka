const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Idopontok = sequelize.define(
  "Idopontok",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    garage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  },
  {
    tableName: "Idopontok",
    timestamps: true,
  }
);

module.exports = Idopontok;
