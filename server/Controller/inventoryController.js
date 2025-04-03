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
      sort_order,
      season,
      width,
      profile,
      diameter
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

    // Filter by season
    if (season && ['winter', 'summer', 'all_season'].includes(season)) {
      whereConditions.season = season;
    }

    // Filter by tyre dimensions
    if (width) {
      const parsedWidth = parseInt(width, 10);
      if (!isNaN(parsedWidth)) {
        whereConditions.width = parsedWidth;
      }
    }

    if (profile) {
      const parsedProfile = parseInt(profile, 10);
      if (!isNaN(parsedProfile)) {
        whereConditions.profile = parsedProfile;
      }
    }

    if (diameter) {
      const parsedDiameter = parseInt(diameter, 10);
      if (!isNaN(parsedDiameter)) {
        whereConditions.diameter = parsedDiameter;
      }
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
        "quantity", "unit_price", "cover_img", "additional_img1", "additional_img2",
        "season", "width", "profile", "diameter", "createdAt", "updatedAt"
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
    const {
      garage_id,
      item_name,
      vehicle_type,
      quantity,
      unit_price,
      description,
      season,
      width,
      profile,
      diameter
    } = req.body;

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

    // Validate season if provided
    if (season && !['winter', 'summer', 'all_season'].includes(season)) {
      return res.status(400).json({
        message: "Invalid season. Must be one of: winter, summer, all_season",
        received: season
      });
    }

    // Validate numeric fields
    const parsedGarageId = parseInt(garage_id, 10);
    const parsedQuantity = parseInt(quantity || 0, 10);
    const parsedUnitPrice = parseFloat(unit_price);
    const parsedWidth = width ? parseInt(width, 10) : null;
    const parsedProfile = profile ? parseInt(profile, 10) : null;
    const parsedDiameter = diameter ? parseInt(diameter, 10) : null;

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

    // Handle the uploaded files
    let cover_img = null;
    let additional_img1 = null;
    let additional_img2 = null;

    if (req.files) {
      // Handle cover image
      if (req.files.cover_img && req.files.cover_img[0]) {
        cover_img = `/uploads/inventory/${req.files.cover_img[0].filename}`;
      }

      // Handle additional images
      if (req.files.additional_img1 && req.files.additional_img1[0]) {
        additional_img1 = `/uploads/inventory/${req.files.additional_img1[0].filename}`;
      }

      if (req.files.additional_img2 && req.files.additional_img2[0]) {
        additional_img2 = `/uploads/inventory/${req.files.additional_img2[0].filename}`;
      }
    }

    // Create the item
    const newItem = await Inventory.create({
      garage_id: parsedGarageId,
      item_name,
      vehicle_type,
      quantity: parsedQuantity,
      unit_price: parsedUnitPrice,
      description,
      cover_img,
      additional_img1,
      additional_img2,
      season,
      width: parsedWidth,
      profile: parsedProfile,
      diameter: parsedDiameter
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

    const {
      item_name,
      vehicle_type,
      quantity,
      unit_price,
      description,
      garage_id,
      season,
      width,
      profile,
      diameter,
      remove_additional_img1,
      remove_additional_img2
    } = req.body;

    // Validate vehicle type if provided
    if (vehicle_type && !['car', 'motorcycle', 'truck'].includes(vehicle_type)) {
      return res.status(400).json({
        message: "Invalid vehicle type. Must be one of: car, motorcycle, truck",
        received: vehicle_type
      });
    }

    // Validate season if provided
    if (season && !['winter', 'summer', 'all_season'].includes(season)) {
      return res.status(400).json({
        message: "Invalid season. Must be one of: winter, summer, all_season",
        received: season
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

    // Validate tyre size fields if provided
    const parsedWidth = width !== undefined ? parseInt(width, 10) : null;
    const parsedProfile = profile !== undefined ? parseInt(profile, 10) : null;
    const parsedDiameter = diameter !== undefined ? parseInt(diameter, 10) : null;

    if (
      (width !== undefined && isNaN(parsedWidth)) ||
      (profile !== undefined && isNaN(parsedProfile)) ||
      (diameter !== undefined && isNaN(parsedDiameter))
    ) {
      return res.status(400).json({
        message: "Invalid tyre size values",
        details: {
          width: width !== undefined && isNaN(parsedWidth) ? "Must be a number" : "Valid",
          profile: profile !== undefined && isNaN(parsedProfile) ? "Must be a number" : "Valid",
          diameter: diameter !== undefined && isNaN(parsedDiameter) ? "Must be a number" : "Valid"
        }
      });
    }

    // Handle the uploaded files
    let cover_img = item.cover_img;
    let additional_img1 = item.additional_img1;
    let additional_img2 = item.additional_img2;

    if (req.files) {
      // Handle cover image
      if (req.files.cover_img && req.files.cover_img[0]) {
        // Delete old image if it exists
        if (item.cover_img) {
          const oldImagePath = path.join(__dirname, '..', item.cover_img);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        cover_img = `/uploads/inventory/${req.files.cover_img[0].filename}`;
      }

      // Handle additional image 1
      if (req.files.additional_img1 && req.files.additional_img1[0]) {
        // Delete old image if it exists
        if (item.additional_img1) {
          const oldImagePath = path.join(__dirname, '..', item.additional_img1);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        additional_img1 = `/uploads/inventory/${req.files.additional_img1[0].filename}`;
      }

      // Handle additional image 2
      if (req.files.additional_img2 && req.files.additional_img2[0]) {
        // Delete old image if it exists
        if (item.additional_img2) {
          const oldImagePath = path.join(__dirname, '..', item.additional_img2);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        additional_img2 = `/uploads/inventory/${req.files.additional_img2[0].filename}`;
      }
    }

    // Handle image removal requests
    if (remove_additional_img1 === 'true' && item.additional_img1) {
      const oldImagePath = path.join(__dirname, '..', item.additional_img1);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      additional_img1 = null;
    }

    if (remove_additional_img2 === 'true' && item.additional_img2) {
      const oldImagePath = path.join(__dirname, '..', item.additional_img2);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      additional_img2 = null;
    }

    // Update the item
    await item.update({
      item_name: item_name || item.item_name,
      vehicle_type: vehicle_type || item.vehicle_type,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : item.quantity,
      unit_price: unit_price ? parseFloat(unit_price) : item.unit_price,
      description: description !== undefined ? description : item.description,
      garage_id: garage_id ? parseInt(garage_id, 10) : item.garage_id,
      cover_img,
      additional_img1,
      additional_img2,
      season: season || item.season,
      width: width !== undefined ? parsedWidth : item.width,
      profile: profile !== undefined ? parsedProfile : item.profile,
      diameter: diameter !== undefined ? parsedDiameter : item.diameter
    });

    // Return the updated item with garage details
    const updatedItemWithGarage = await Inventory.findByPk(item.id, {
      include: [
        {
          model: Garage,
          attributes: ["id", "name", "location", "contact_info"],
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

    // Delete all image files if they exist
    const imageFields = ['cover_img', 'additional_img1', 'additional_img2'];

    for (const field of imageFields) {
      if (item[field]) {
        const imagePath = path.join(__dirname, '..', item[field]);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
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
      attributes: [
        "id", "garage_id", "item_name", "vehicle_type", "quantity", "unit_price",
        "cover_img", "additional_img1", "additional_img2", "season",
        "width", "profile", "diameter", "createdAt", "updatedAt"
      ],
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