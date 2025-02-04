const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Munkafolyamat = sequelize.define(
  "Munkafolyamat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    mechanic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "munkafolyamatok",
    timestamps: true,
  }
);

module.exports = Munkafolyamat;