const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const bcrypt = require("bcrypt");

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
      validate: {
        isEmail: true, // Ellenőrzi, hogy helyes e-mail formátum-e
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "worker"),
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    tableName: "felhasznalok",
    timestamps: true,
  }
);

module.exports = Felhasznalo;
