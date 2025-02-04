const Keszlet = require("../model/inventory");

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Keszlet.findAll({
      attributes: ["id", "garage_id", "item_name", "quantity", "unit_price"],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get inventory item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Keszlet.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new inventory item
exports.createItem = async (req, res) => {
  try {
    const { garage_id, item_name, quantity, unit_price } = req.body;

    if (!garage_id || !item_name || !unit_price) {
      return res.status(400).json({ message: "Missing required fields (garage_id, item_name, unit_price)" });
    }

    const newItem = await Keszlet.create({
      garage_id,
      item_name,
      quantity: quantity || 0,
      unit_price,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
