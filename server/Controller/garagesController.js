const Garage = require("../model/garages");

// Get all garages
exports.getAllGarages = async (req, res) => {
  try {
    const garages = await Garage.findAll({
      attributes: ["id", "owner_id", "name", "location", "contact_info"],
    });
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a garage by ID
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

// Create a new garage
exports.createGarage = async (req, res) => {
  try {
    const { owner_id, name, location, contact_info } = req.body;

    if (!owner_id || !name || !location) {
      return res.status(400).json({ message: "Missing required fields (owner_id, name, location)" });
    }

    const newGarage = await Garage.create({
      owner_id,
      name,
      location,
      contact_info,
    });

    res.status(201).json(newGarage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing garage
exports.updateGarage = async (req, res) => {
  try {
    const { owner_id, name, location, contact_info } = req.body;
    const garage = await Garage.findByPk(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await garage.update({ owner_id, name, location, contact_info });

    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a garage
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
