const Idopontok = require("../model/appointments");

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Idopontok.findAll({
      attributes: ["id", "user_id", "garage_id", "appointment_time", "status"],
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get an appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Idopontok.findByPk(req.params.id);
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
    const { user_id, garage_id, appointment_time, status } = req.body;

    if (!user_id || !garage_id || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields (user_id, garage_id, appointment_time)" });
    }

    const newAppointment = await Idopontok.create({
      user_id,
      garage_id,
      appointment_time,
      status: status || "pending",
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { user_id, garage_id, appointment_time, status } = req.body;
    const appointment = await Idopontok.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.update({ user_id, garage_id, appointment_time, status });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Idopontok.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.destroy();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
