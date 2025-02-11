const Jarmuvek = require("../model/vehicles");

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Jarmuvek.findAll({
      attributes: ["id", "user_id", "license_plate", "make", "model", "year", "notes"],
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Jarmuvek.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { user_id, license_plate, make, model, year, notes } = req.body;

    if (!user_id || !license_plate || !make || !model || !year) {
      return res.status(400).json({ message: "Missing required fields (user_id, license_plate, make, model, year)" });
    }

    const newVehicle = await Jarmuvek.create({
      user_id,
      license_plate,
      make,
      model,
      year,
      notes,
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { user_id, license_plate, make, model, year, notes } = req.body;
    const vehicle = await Jarmuvek.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.update({ user_id, license_plate, make, model, year, notes });

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Jarmuvek.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.destroy();

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
