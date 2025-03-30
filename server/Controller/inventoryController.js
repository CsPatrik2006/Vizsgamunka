const Inventory = require("../model/inventory");
const Garage = require("../model/garages");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');

// Get all inventory items with filtering options
exports.getAllItems = async (req, res) => {
  try {
    const {
      garage_id,
      vehicle_type,
      min_price,
      max_price,
      search,
      sort_by,
      sort_order
    } = req.query;

    // Build query conditions
    let whereConditions = {};

    // Filter by garage_id
    if (garage_id) {
      const parsedGarageId = parseInt(garage_id, 10);
      if (!isNaN(parsedGarageId)) {
        whereConditions.garage_id = parsedGarageId;
      }
    }

    // Filter by vehicle_type
    if (vehicle_type && ['car', 'motorcycle', 'truck'].includes(vehicle_type)) {
      whereConditions.vehicle_type = vehicle_type;
    }

    // Filter by price range
    if (min_price || max_price) {
      whereConditions.unit_price = {};

      if (min_price) {
        const parsedMinPrice = parseFloat(min_price);
        if (!isNaN(parsedMinPrice)) {
          whereConditions.unit_price[Op.gte] = parsedMinPrice;
        }
      }

      if (max_price) {
        const parsedMaxPrice = parseFloat(max_price);
        if (!isNaN(parsedMaxPrice)) {
          whereConditions.unit_price[Op.lte] = parsedMaxPrice;
        }
      }
    }

    // Search by item name
    if (search) {
      whereConditions.item_name = {
        [Op.like]: `%${search}%`
      };
    }

    // Build sort options
    let order = [];
    if (sort_by) {
      const validSortFields = ['item_name', 'unit_price', 'quantity', 'createdAt'];
      const validSortOrders = ['ASC', 'DESC'];

      if (validSortFields.includes(sort_by)) {
        const sortDirection = validSortOrders.includes(sort_order?.toUpperCase())
          ? sort_order.toUpperCase()
          : 'ASC';

        order.push([sort_by, sortDirection]);
      }
    }

    // Execute query with all filters
    const items = await Inventory.findAll({
      where: whereConditions,
      order: order.length > 0 ? order : [['createdAt', 'DESC']],
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        }
      ],
      attributes: [
        "id", "garage_id", "item_name", "vehicle_type",
        "quantity", "unit_price", "cover_img", "createdAt", "updatedAt"
      ],
    });

    res.json(items);
  } catch (error) {
    console.error("Error in getAllItems:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get inventory item by ID with garage details
exports.getItemById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id, {
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location", "contact_info"],
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error in getItemById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new inventory item
exports.createItem = async (req, res) => {
  try {
    const { garage_id, item_name, vehicle_type, quantity, unit_price, description } = req.body;

    // Validate required fields
    if (!garage_id || !item_name || !vehicle_type || !unit_price) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["garage_id", "item_name", "vehicle_type", "unit_price"],
        received: { garage_id, item_name, vehicle_type, unit_price }
      });
    }

    // Validate vehicle type
    if (!['car', 'motorcycle', 'truck'].includes(vehicle_type)) {
      return res.status(400).json({
        message: "Invalid vehicle type. Must be one of: car, motorcycle, truck",
        received: vehicle_type
      });
    }

    // Validate numeric fields
    const parsedGarageId = parseInt(garage_id, 10);
    const parsedQuantity = parseInt(quantity || 0, 10);
    const parsedUnitPrice = parseFloat(unit_price);

    if (isNaN(parsedGarageId) || isNaN(parsedQuantity) || isNaN(parsedUnitPrice)) {
      return res.status(400).json({
        message: "Invalid numeric values",
        details: {
          garage_id: isNaN(parsedGarageId) ? "Must be a number" : "Valid",
          quantity: isNaN(parsedQuantity) ? "Must be a number" : "Valid",
          unit_price: isNaN(parsedUnitPrice) ? "Must be a number" : "Valid"
        }
      });
    }

    // Check if garage exists
    const garage = await Garage.findByPk(parsedGarageId);
    if (!garage) {
      return res.status(404).json({ message: `Garage with ID ${parsedGarageId} not found` });
    }

    // Handle the uploaded file
    let cover_img = null;
    if (req.file) {
      cover_img = `/uploads/inventory/${req.file.filename}`;
    }

    // Create the item
    const newItem = await Inventory.create({
      garage_id: parsedGarageId,
      item_name,
      vehicle_type,
      quantity: parsedQuantity,
      unit_price: parsedUnitPrice,
      description, // Add description field
      cover_img,
    });

    // Return the created item with garage details
    const createdItemWithGarage = await Inventory.findByPk(newItem.id, {
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location"],
        }
      ]
    });

    res.status(201).json(createdItemWithGarage);
  } catch (error) {
    console.error("Error in createItem:", error);

    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: "Item already exists",
        details: error.errors.map(e => e.message)
      });
    }

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

    const { item_name, vehicle_type, quantity, unit_price, description, garage_id } = req.body;

    // Validate vehicle type if provided
    if (vehicle_type && !['car', 'motorcycle', 'truck'].includes(vehicle_type)) {
      return res.status(400).json({
        message: "Invalid vehicle type. Must be one of: car, motorcycle, truck",
        received: vehicle_type
      });
    }

    // Validate numeric fields if provided
    if (garage_id) {
      const parsedGarageId = parseInt(garage_id, 10);
      if (isNaN(parsedGarageId)) {
        return res.status(400).json({ message: "garage_id must be a number" });
      }

      // Check if garage exists
      const garage = await Garage.findByPk(parsedGarageId);
      if (!garage) {
        return res.status(404).json({ message: `Garage with ID ${parsedGarageId} not found` });
      }
    }

    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity)) {
        return res.status(400).json({ message: "quantity must be a number" });
      }
    }

    if (unit_price) {
      const parsedUnitPrice = parseFloat(unit_price);
      if (isNaN(parsedUnitPrice)) {
        return res.status(400).json({ message: "unit_price must be a number" });
      }
    }

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

    // Update the item
    await item.update({
      item_name: item_name || item.item_name,
      vehicle_type: vehicle_type || item.vehicle_type,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : item.quantity,
      unit_price: unit_price ? parseFloat(unit_price) : item.unit_price,
      description: description !== undefined ? description : item.description,
      garage_id: garage_id ? parseInt(garage_id, 10) : item.garage_id,
      cover_img
    });

    // Return the updated item with garage details - FIX THE ATTRIBUTES HERE
    const updatedItemWithGarage = await Inventory.findByPk(item.id, {
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location", "contact_info"], // Changed from "contact" to "contact_info"
        }
      ]
    });

    res.json(updatedItemWithGarage);
  } catch (error) {
    console.error("Error in updateItem:", error);
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
    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem: {
        id: item.id,
        item_name: item.item_name,
        garage_id: item.garage_id
      }
    });
  } catch (error) {
    console.error("Error in deleteItem:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get inventory items by garage ID
exports.getItemsByGarageId = async (req, res) => {
  try {
    const { garageId } = req.params;

    // Validate garage ID
    const parsedGarageId = parseInt(garageId, 10);
    if (isNaN(parsedGarageId)) {
      return res.status(400).json({ message: "Invalid garage ID" });
    }

    // Check if garage exists
    const garage = await Garage.findByPk(parsedGarageId);
    if (!garage) {
      return res.status(404).json({ message: `Garage with ID ${parsedGarageId} not found` });
    }

    // Get items for this garage
    const items = await Inventory.findAll({
      where: { garage_id: parsedGarageId },
      attributes: ["id", "garage_id", "item_name", "vehicle_type", "quantity", "unit_price", "cover_img", "createdAt", "updatedAt"],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      garage: {
        id: garage.id,
        name: garage.name,
        location: garage.location
      },
      items: items
    });
  } catch (error) {
    console.error("Error in getItemsByGarageId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update inventory item quantity
exports.updateItemQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity)) {
      return res.status(400).json({ message: "quantity must be a number" });
    }

    // Find the item
    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update quantity
    await item.update({ quantity: parsedQuantity });

    res.json({
      message: "Quantity updated successfully",
      item: {
        id: item.id,
        item_name: item.item_name,
        quantity: item.quantity,
        previous_quantity: item.previous('quantity')
      }
    });
  } catch (error) {
    console.error("Error in updateItemQuantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};