const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Product = sequelize.define(
  "Product",
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
    ar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    meret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    boritokep: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    images2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    images3: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    csoport: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    termekleiras: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kiszereles: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    keszlet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    megjegyzes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
