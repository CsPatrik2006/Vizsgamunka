const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Szerviz = sequelize.define(
  "Szerviz",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_info: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    tableName: "Szervizek",
    timestamps: true,
  }
);

module.exports = Szerviz;
