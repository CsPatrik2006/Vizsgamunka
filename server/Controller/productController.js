const Product = require("../model/products");

// Get all products (only selected fields)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ["azonosito", "nev", "ar", "boritokep"],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      boritokep,
      images2,
      images3,
      nev,
      ar,
      meret,
      csoport,
      termekleiras,
      kiszereles,
      keszlet,
      megjegyzes,
    } = req.body;

    if (!nev || !ar || !meret) {
      return res.status(400).json({ message: "Missing required fields (nev, ar, meret)" });
    }

    const newProduct = await Product.create({
      boritokep,
      images2,
      images3,
      nev,
      ar,
      meret,
      csoport,
      termekleiras,
      kiszereles,
      keszlet,
      megjegyzes,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
