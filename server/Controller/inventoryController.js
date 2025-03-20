const Inventory = require("../model/inventory");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const { garage_id } = req.query;
    
    // Build query conditions
    let whereConditions = {};
    
    if (garage_id) {
      // Ensure garage_id is treated as a number
      const parsedGarageId = parseInt(garage_id, 10);
      
      if (!isNaN(parsedGarageId)) {
        whereConditions = {
          garage_id: {
            [Op.eq]: parsedGarageId
          }
        };
      }
    }
    
    const items = await Inventory.findAll({
      where: whereConditions,
      attributes: ["id", "garage_id", "item_name", "vehicle_type", "quantity", "unit_price", "cover_img"],
    });
    
    res.json(items);
  } catch (error) {
    console.error("Error in getAllItems:", error);
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

    // Handle the uploaded file
    let cover_img = null;
    if (req.file) {
      cover_img = `/uploads/inventory/${req.file.filename}`;
    }

    const newItem = await Inventory.create({
      garage_id,
      item_name,
      vehicle_type,
      quantity: quantity || 0,
      unit_price,
      cover_img,
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

    // Handle the uploaded file
    let cover_img = item.cover_img;
    if (req.file) {
      // Delete old image if it exists
      if (item.cover_img) {
        const oldImagePath = path.join(__dirname, '..', item.cover_img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      cover_img = `/uploads/inventory/${req.file.filename}`;
    }

    await item.update({
      item_name: item_name || item.item_name,
      vehicle_type: vehicle_type || item.vehicle_type,
      quantity: quantity !== undefined ? quantity : item.quantity,
      unit_price: unit_price || item.unit_price,
      cover_img
    });
    
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

    // Delete the image file if it exists
    if (item.cover_img) {
      const imagePath = path.join(__dirname, '..', item.cover_img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.destroy();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};