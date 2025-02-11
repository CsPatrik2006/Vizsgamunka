const Szolgaltatasok = require("../model/services");

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Szolgaltatasok.findAll({
      attributes: ["id", "name", "description", "price", "duration", "garage_id"],
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Szolgaltatasok.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration, garage_id } = req.body;

    if (!name || !price || !duration || !garage_id) {
      return res.status(400).json({ message: "Missing required fields (name, price, duration, garage_id)" });
    }

    const newService = await Szolgaltatasok.create({
      name,
      description,
      price,
      duration,
      garage_id,
    });

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing service
exports.updateService = async (req, res) => {
  try {
    const { name, description, price, duration, garage_id } = req.body;
    const service = await Szolgaltatasok.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.update({ name, description, price, duration, garage_id });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Szolgaltatasok.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.destroy();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
