const Szerviz = require("../model/garages");

// Get all garages
exports.getAllGarages = async (req, res) => {
  try {
    const garages = await Szerviz.findAll({
      attributes: ["id", "name", "location", "contact_info"],
    });
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a garage by ID
exports.getGarageById = async (req, res) => {
  try {
    const garage = await Szerviz.findByPk(req.params.id);
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
    const { name, location, contact_info } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Missing required fields (name, location)" });
    }

    const newGarage = await Szerviz.create({
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
    const { name, location, contact_info } = req.body;
    const garage = await Szerviz.findByPk(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await garage.update({ name, location, contact_info });

    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a garage
exports.deleteGarage = async (req, res) => {
  try {
    const garage = await Szerviz.findByPk(req.params.id);
    
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await garage.destroy();

    res.json({ message: "Garage deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
