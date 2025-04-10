const Appointments = require("../model/appointments");
const GarageScheduleSlot = require("../model/garageSchedule");
const User = require("../model/users");
const Garage = require("../model/garages");
const { Op } = require("sequelize");

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

exports.createAppointment = async (req, res) => {
  try {
    const { user_id, garage_id, appointment_time, status, order_id, schedule_slot_id } = req.body;

    if (!user_id || !garage_id || !appointment_time || !order_id) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, appointment_time, order_id)" });
    }

    if (schedule_slot_id) {
      const slot = await GarageScheduleSlot.findByPk(schedule_slot_id);
      
      if (!slot) {
        return res.status(404).json({ message: "Schedule slot not found" });
      }
      
      if (slot.garage_id.toString() !== garage_id.toString()) {
        return res.status(400).json({ message: "Schedule slot does not belong to the specified garage" });
      }
      
      const appointmentDate = new Date(appointment_time);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      
      if (dayOfWeek !== slot.day_of_week) {
        return res.status(400).json({ message: "Appointment day does not match slot day" });
      }
      
      const appointmentTimeStr = appointmentDate.toTimeString().substring(0, 8);
      
      if (appointmentTimeStr < slot.start_time || appointmentTimeStr >= slot.end_time) {
        return res.status(400).json({ message: "Appointment time is outside the slot's time range" });
      }

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

exports.updateAppointment = async (req, res) => {
  try {
    const { user_id, garage_id, appointment_time, status, order_id, schedule_slot_id } = req.body;
    const appointment = await Appointments.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const previousStatus = appointment.status;

    if (schedule_slot_id && schedule_slot_id !== appointment.schedule_slot_id) {
      const slot = await GarageScheduleSlot.findByPk(schedule_slot_id);
      
      if (!slot) {
        return res.status(404).json({ message: "Schedule slot not found" });
      }
      
      if (slot.garage_id.toString() !== (garage_id || appointment.garage_id).toString()) {
        return res.status(400).json({ message: "Schedule slot does not belong to the specified garage" });
      }
      
      const appointmentDate = new Date(appointment_time || appointment.appointment_time);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      
      if (dayOfWeek !== slot.day_of_week) {
        return res.status(400).json({ message: "Appointment day does not match slot day" });
      }
      
      const appointmentTimeStr = appointmentDate.toTimeString().substring(0, 8);
      
      if (appointmentTimeStr < slot.start_time || appointmentTimeStr >= slot.end_time) {
        return res.status(400).json({ message: "Appointment time is outside the slot's time range" });
      }
      
      const existingAppointments = await Appointments.count({
        where: {
          garage_id: garage_id || appointment.garage_id,
          schedule_slot_id,
          id: {
            [Op.ne]: appointment.id
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

    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        const User = require("../model/users");
        const user = await User.findByPk(appointment.user_id);
        
        const Garage = require("../model/garages");
        const garage = await Garage.findByPk(appointment.garage_id);

        let scheduleSlot = null;
        if (appointment.schedule_slot_id) {
          const GarageScheduleSlot = require("../model/garageSchedule");
          scheduleSlot = await GarageScheduleSlot.findByPk(appointment.schedule_slot_id);
        }

        const emailService = require("../utils/emailService");
        await emailService.sendAppointmentConfirmationEmail(user, appointment, garage, scheduleSlot);
      } catch (emailError) {
        console.error("Failed to send appointment confirmation email:", emailError);
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

exports.getAppointmentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Unauthorized access to another user's appointments" });
    }

    const appointments = await Appointments.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        },
        {
          model: GarageScheduleSlot,
          attributes: ["id", "day_of_week", "start_time", "end_time"],
        }
      ],
      order: [['appointment_time', 'DESC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments by user ID:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};