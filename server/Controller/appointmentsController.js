const Appointments = require("../model/appointments");
const GarageScheduleSlot = require("../model/garageSchedule");
const { Op } = require("sequelize");

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointments.findAll({
      attributes: ["id", "user_id", "garage_id", "schedule_slot_id", "appointment_time", "status", "order_id"],
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get an appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointments.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { user_id, garage_id, appointment_time, status, order_id, schedule_slot_id } = req.body;

    if (!user_id || !garage_id || !appointment_time || !order_id) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, appointment_time, order_id)" });
    }

    // If a schedule_slot_id is provided, validate it
    if (schedule_slot_id) {
      const slot = await GarageScheduleSlot.findByPk(schedule_slot_id);
      
      if (!slot) {
        return res.status(404).json({ message: "Schedule slot not found" });
      }
      
      if (slot.garage_id.toString() !== garage_id.toString()) {
        return res.status(400).json({ message: "Schedule slot does not belong to the specified garage" });
      }
      
      // Check if the appointment time falls within the slot's time range
      const appointmentDate = new Date(appointment_time);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      
      if (dayOfWeek !== slot.day_of_week) {
        return res.status(400).json({ message: "Appointment day does not match slot day" });
      }
      
      const appointmentTimeStr = appointmentDate.toTimeString().substring(0, 8); // HH:MM:SS
      
      if (appointmentTimeStr < slot.start_time || appointmentTimeStr >= slot.end_time) {
        return res.status(400).json({ message: "Appointment time is outside the slot's time range" });
      }
      
      // Check if the slot is already fully booked
      const existingAppointments = await Appointments.count({
        where: {
          garage_id,
          schedule_slot_id,
          appointment_time: {
            [Op.between]: [
              `${appointmentDate.toISOString().split('T')[0]}T${slot.start_time}`,
              `${appointmentDate.toISOString().split('T')[0]}T${slot.end_time}`
            ]
          },
          status: {
            [Op.notIn]: ['canceled']
          }
        }
      });
      
      if (existingAppointments >= slot.max_bookings) {
        return res.status(400).json({ message: "This time slot is already fully booked" });
      }
    }

    const newAppointment = await Appointments.create({
      user_id,
      garage_id,
      schedule_slot_id,
      appointment_time,
      status: status || "pending",
      order_id,
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { user_id, garage_id, appointment_time, status, order_id, schedule_slot_id } = req.body;
    const appointment = await Appointments.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // If changing the schedule_slot_id, validate it
    if (schedule_slot_id && schedule_slot_id !== appointment.schedule_slot_id) {
      const slot = await GarageScheduleSlot.findByPk(schedule_slot_id);
      
      if (!slot) {
        return res.status(404).json({ message: "Schedule slot not found" });
      }
      
      if (slot.garage_id.toString() !== (garage_id || appointment.garage_id).toString()) {
        return res.status(400).json({ message: "Schedule slot does not belong to the specified garage" });
      }
      
      // Check if the appointment time falls within the slot's time range
      const appointmentDate = new Date(appointment_time || appointment.appointment_time);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      
      if (dayOfWeek !== slot.day_of_week) {
        return res.status(400).json({ message: "Appointment day does not match slot day" });
      }
      
      const appointmentTimeStr = appointmentDate.toTimeString().substring(0, 8); // HH:MM:SS
      
      if (appointmentTimeStr < slot.start_time || appointmentTimeStr >= slot.end_time) {
        return res.status(400).json({ message: "Appointment time is outside the slot's time range" });
      }
      
      // Check if the slot is already fully booked
      const existingAppointments = await Appointments.count({
        where: {
          garage_id: garage_id || appointment.garage_id,
          schedule_slot_id,
          id: {
            [Op.ne]: appointment.id // Exclude the current appointment
          },
          appointment_time: {
            [Op.between]: [
              `${appointmentDate.toISOString().split('T')[0]}T${slot.start_time}`,
              `${appointmentDate.toISOString().split('T')[0]}T${slot.end_time}`
            ]
          },
          status: {
            [Op.notIn]: ['canceled']
          }
        }
      });
      
      if (existingAppointments >= slot.max_bookings) {
        return res.status(400).json({ message: "This time slot is already fully booked" });
      }
    }

    await appointment.update({ 
      user_id, 
      garage_id, 
      schedule_slot_id,
      appointment_time, 
      status, 
      order_id 
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointments.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.destroy();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};