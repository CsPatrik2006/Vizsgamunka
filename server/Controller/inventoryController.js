const Inventory = require("../model/inventory");

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.findAll({
      attributes: ["id", "garage_id", "item_name", "vehicle_type", "quantity", "unit_price"],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get inventory item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
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
    const { garage_id, item_name, vehicle_type, quantity, unit_price } = req.body;

    if (!garage_id || !item_name || !vehicle_type || !unit_price) {
      return res.status(400).json({ message: "Missing required fields (garage_id, item_name, vehicle_type, unit_price)" });
    }

    const newItem = await Inventory.create({
      garage_id,
      item_name,
      vehicle_type,
      quantity: quantity || 0,
      unit_price,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing inventory item
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { item_name, vehicle_type, quantity, unit_price } = req.body;

    item.item_name = item_name || item.item_name;
    item.vehicle_type = vehicle_type || item.vehicle_type;
    item.quantity = quantity || item.quantity;
    item.unit_price = unit_price || item.unit_price;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an inventory item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.destroy();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
