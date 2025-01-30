const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Partner = sequelize.define(
  "Partner",
  {
    azonosito: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nev: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cim: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefonszam: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nyitvatartas: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
  },
  {
    tableName: "Partners",
    timestamps: true,
  }
);

module.exports = Partner;
