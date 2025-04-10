const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/config");
const Garage = require("./garages");

const GarageScheduleSlot = sequelize.define(
  "GarageScheduleSlot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    day_of_week: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    max_bookings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    tableName: "garage_schedule_slots",
    timestamps: true,
    indexes: [
      {
        fields: ['garage_id', 'day_of_week'],
      },
      {
        fields: ['garage_id', 'day_of_week', 'start_time', 'end_time'],
        unique: true,
      }
    ]
  }
);

GarageScheduleSlot.beforeCreate(async (slot) => {
  const overlappingSlots = await GarageScheduleSlot.findOne({
    where: {
      garage_id: slot.garage_id,
      day_of_week: slot.day_of_week,
      is_active: true,
      [Op.or]: [
        {
          [Op.and]: [
            { start_time: { [Op.lte]: slot.start_time } },
            { end_time: { [Op.gt]: slot.start_time } }
          ]
        },
        {
          [Op.and]: [
            { start_time: { [Op.lt]: slot.end_time } },
            { end_time: { [Op.gte]: slot.end_time } }
          ]
        },
        {
          [Op.and]: [
            { start_time: { [Op.gte]: slot.start_time } },
            { end_time: { [Op.lte]: slot.end_time } }
          ]
        }
      ]
    }
  });

  if (overlappingSlots) {
    throw new Error('Time slot overlaps with an existing slot');
  }
});

module.exports = GarageScheduleSlot;