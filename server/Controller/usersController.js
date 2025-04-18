const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/users");
const { sendRegistrationEmail } = require("../utils/emailService");

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role, password } = req.body;

    if (!first_name || !last_name || !email || !role || !password) {
      return res.status(400).json({ message: "Hiányzó kötelező mezők (vezetéknév, keresztnév, email, szerep, jelszó)!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      phone,
      role,
      password_hash: hashedPassword,
      last_login: new Date(),
    });

    try {
      await sendRegistrationEmail(newUser);
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
    }

    res.status(201).json({ message: "Felhasználó sikeresen létrehozva!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba a létrehozás során!", error: error.message });
  }
};

exports.authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Hiányzó bejelentkezési adatok!" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    await User.update({ last_login: new Date() }, { where: { id: user.id } });

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      "secretkey",
      { expiresIn: "24h" }
    );

    res.json({ message: "Sikeres bejelentkezés!", token, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba hitelesítés közben!", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role", "createdAt", "updatedAt", "last_login"],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba felhasználók lekérésekor!", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) return res.status(404).json({ message: "Felhasználó nem található!" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba felhasználó lekérésekor!", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó adatainak módosításához!" });
    }

    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const [updated] = await User.update(updates, { where: { id } });
    if (!updated) return res.status(404).json({ message: "Felhasználó nem található!" });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.json({ message: "Felhasználó sikeresen frissítve!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba frissítés közben!", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Hiányzó jelszó adatok!" });
    }

    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó jelszavának módosításához!" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Felhasználó nem található!" });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Jelenlegi jelszó helytelen!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password_hash: hashedPassword }, { where: { id } });

    res.json({ message: "Jelszó sikeresen módosítva!" });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba jelszó módosítás közben!", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó törlésére!" });
    }
    
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.json({ message: "Felhasználó sikeresen törölve!" });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba törlés közben!", error: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó profilképének módosításához!" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Nem található feltöltött fájl!" });
    }

    const profilePicturePath = `/api/uploads/profile-pictures/${req.file.filename}`;

    const [updated] = await User.update(
      { profile_picture: profilePicturePath }, 
      { where: { id } }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });
    
    res.json({ 
      message: "Profilkép sikeresen frissítve!", 
      user: updatedUser,
      profilePicture: profilePicturePath
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: "Szerverhiba a profilkép feltöltése közben!", error: error.message });
  }
};