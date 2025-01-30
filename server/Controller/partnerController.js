const Partner = require("../model/partner");

// Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll({
      attributes: ["azonosito", "nev", "cim", "telefonszam", "email", "nyitvatartas"],
    });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get partner by ID
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new partner
exports.createPartner = async (req, res) => {
  try {
    const { nev, cim, telefonszam, email, nyitvatartas } = req.body;

    if (!nev || !cim) {
      return res.status(400).json({ message: "Missing required fields (nev, cim)" });
    }

    const newPartner = await Partner.create({
      nev,
      cim,
      telefonszam,
      email,
      nyitvatartas,
    });

    res.status(201).json(newPartner);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
