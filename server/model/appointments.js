const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../model/users");
const Garage = require("../model/garages");
const GarageScheduleSlot = require("../model/garageSchedule");

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
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    garage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Garage,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    schedule_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GarageScheduleSlot,
        key: "id",
      },
      onDelete: "SET NULL",
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
        model: "orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
  }
);

Appointments.belongsTo(User, { foreignKey: 'user_id' });
Appointments.belongsTo(Garage, { foreignKey: 'garage_id' });
Appointments.belongsTo(GarageScheduleSlot, { foreignKey: 'schedule_slot_id' });

module.exports = Appointments;