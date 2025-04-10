const Garage = require("../model/garages");
const GarageScheduleSlot = require("../model/garageSchedule");
const Appointments = require("../model/appointments");
const { Op } = require("sequelize");

exports.getAllGarages = async (req, res) => {
  try {
    const garages = await Garage.findAll({
      attributes: ["id", "owner_id", "name", "location", "contact_info", "description", "opening_hours"],
    });
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findByPk(req.params.id);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }
    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createGarage = async (req, res) => {
  try {
    const { owner_id, name, location, contact_info, description, opening_hours } = req.body;

    if (!owner_id || !name || !location) {
      return res.status(400).json({ message: "Missing required fields (owner_id, name, location)" });
    }

    const newGarage = await Garage.create({
      owner_id,
      name,
      location,
      contact_info,
      description,
      opening_hours
    });

    res.status(201).json(newGarage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateGarage = async (req, res) => {
  try {
    const { owner_id, name, location, contact_info, description, opening_hours } = req.body;
    const garage = await Garage.findByPk(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await garage.update({ 
      owner_id, 
      name, 
      location, 
      contact_info,
      description,
      opening_hours
    });

    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findByPk(req.params.id);
    
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await garage.destroy();

    res.json({ message: "Garage deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGarageSchedule = async (req, res) => {
  try {
    const garageId = req.params.id;

    const garage = await Garage.findByPk(garageId);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    const scheduleSlots = await GarageScheduleSlot.findAll({
      where: { 
        garage_id: garageId,
        is_active: true
      },
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    const schedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };
    
    scheduleSlots.forEach(slot => {
      schedule[slot.day_of_week].push({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_bookings: slot.max_bookings
      });
    });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateGarageSchedule = async (req, res) => {
  try {
    const garageId = req.params.id;
    const scheduleData = req.body;

    const garage = await Garage.findByPk(garageId);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    const userId = req.user?.id; 
    if (userId && garage.owner_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You don't have permission to update this garage's schedule" });
    }

    for (const [day, slots] of Object.entries(scheduleData)) {
      if (!Array.isArray(slots)) continue;

      await GarageScheduleSlot.update(
        { is_active: false },
        { 
          where: { 
            garage_id: garageId,
            day_of_week: day
          }
        }
      );

      for (const slot of slots) {
        try {
          const existingSlot = await GarageScheduleSlot.findOne({
            where: {
              garage_id: garageId,
              day_of_week: day,
              start_time: slot.start_time,
              end_time: slot.end_time
            }
          });
          
          if (existingSlot) {
            await existingSlot.update({
              max_bookings: slot.max_bookings,
              is_active: true
            });
          } else {
            await GarageScheduleSlot.create({
              garage_id: garageId,
              day_of_week: day,
              start_time: slot.start_time,
              end_time: slot.end_time,
              max_bookings: slot.max_bookings,
              is_active: true
            });
          }
        } catch (err) {
          console.error(`Error processing slot for ${day}:`, err);
        }
      }
    }
    
    res.json({ message: "Schedule updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { garageId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }
    
    const requestedDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestedDate.getDay()];
    
    const slots = await GarageScheduleSlot.findAll({
      where: {
        garage_id: garageId,
        day_of_week: dayOfWeek,
        is_active: true
      },
      order: [['start_time', 'ASC']]
    });
    
    const dateStr = requestedDate.toISOString().split('T')[0];

    const availableSlots = await Promise.all(slots.map(async (slot) => {
      const startDateTime = `${dateStr}T${slot.start_time}`;
      const endDateTime = `${dateStr}T${slot.end_time}`;

      const appointmentCount = await Appointments.count({
        where: {
          garage_id: garageId,
          appointment_time: {
            [Op.between]: [startDateTime, endDateTime]
          },
          status: {
            [Op.notIn]: ['canceled']
          }
        }
      });
      
      return {
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_bookings: slot.max_bookings,
        available_bookings: Math.max(0, slot.max_bookings - appointmentCount),
        is_full: appointmentCount >= slot.max_bookings
      };
    }));
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};