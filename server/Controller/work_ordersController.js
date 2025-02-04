const Munkafolyamat = require("../model/work_orders");

// Get all work processes
exports.getAllWorkProcesses = async (req, res) => {
  try {
    const workProcesses = await Munkafolyamat.findAll({
      attributes: ["id", "appointment_id", "description", "status", "mechanic_id"],
    });
    res.json(workProcesses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a work process by ID
exports.getWorkProcessById = async (req, res) => {
  try {
    const workProcess = await Munkafolyamat.findByPk(req.params.id);
    if (!workProcess) {
      return res.status(404).json({ message: "Work process not found" });
    }
    res.json(workProcess);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new work process
exports.createWorkProcess = async (req, res) => {
  try {
    const { appointment_id, description, status, mechanic_id } = req.body;

    if (!appointment_id || !description || !mechanic_id) {
      return res.status(400).json({ message: "Missing required fields (appointment_id, description, mechanic_id)" });
    }

    const newWorkProcess = await Munkafolyamat.create({
      appointment_id,
      description,
      status: status || "pending",
      mechanic_id,
    });

    res.status(201).json(newWorkProcess);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing work process
exports.updateWorkProcess = async (req, res) => {
  try {
    const { appointment_id, description, status, mechanic_id } = req.body;
    const workProcess = await Munkafolyamat.findByPk(req.params.id);

    if (!workProcess) {
      return res.status(404).json({ message: "Work process not found" });
    }

    await workProcess.update({ appointment_id, description, status, mechanic_id });

    res.json(workProcess);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a work process
exports.deleteWorkProcess = async (req, res) => {
  try {
    const workProcess = await Munkafolyamat.findByPk(req.params.id);

    if (!workProcess) {
      return res.status(404).json({ message: "Work process not found" });
    }

    await workProcess.destroy();

    res.json({ message: "Work process deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
