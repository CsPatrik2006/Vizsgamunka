const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Felhasznalo = sequelize.define(
  "Felhasznalo",
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "worker"),
      allowNull: false,
    },
  },
  {
    tableName: "Felhasznalok",
    timestamps: true,
  }
);

module.exports = Felhasznalo;
