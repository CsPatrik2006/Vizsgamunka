const Felhasznalo = require("../model/users");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Felhasznalo.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Felhasznalo.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields (name, email, role)" });
    }

    const newUser = await Felhasznalo.create({
      name,
      email,
      phone,
      role,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
