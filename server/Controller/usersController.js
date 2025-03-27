const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/users");

// Regisztráció (Felhasználó létrehozása)
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Hiányzó kötelező mezők (név, email, szerep, jelszó)!" });
    }

    // Jelszó titkosítása
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      password_hash: hashedPassword, // Mentjük a titkosított jelszót
      last_login: new Date(), // Set initial login time
    });

    res.status(201).json({ message: "Felhasználó sikeresen létrehozva!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba a létrehozás során!", error: error.message });
  }
};

// Bejelentkezés és JWT generálás
exports.authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Hiányzó bejelentkezési adatok!" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    // Update last login time
    await User.update({ last_login: new Date() }, { where: { id: user.id } });

    // Get the updated user data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    // JWT generálás
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

// Összes felhasználó lekérése
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

// Felhasználó lekérése ID alapján
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

// Felhasználó frissítése
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure user can only update their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó adatainak módosításához!" });
    }

    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const [updated] = await User.update(updates, { where: { id } });
    if (!updated) return res.status(404).json({ message: "Felhasználó nem található!" });

    // Return the updated user data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.json({ message: "Felhasználó sikeresen frissítve!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba frissítés közben!", error: error.message });
  }
};

// Jelszó módosítása
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Hiányzó jelszó adatok!" });
    }

    // Ensure user can only change their own password unless they're an admin
    if (req.user.role !== 'admin' && req.user.userId != id) {
      return res.status(403).json({ message: "Nincs jogosultsága más felhasználó jelszavának módosításához!" });
    }

    // Get the user with password hash
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Felhasználó nem található!" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Jelenlegi jelszó helytelen!" });

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password_hash: hashedPassword }, { where: { id } });

    res.json({ message: "Jelszó sikeresen módosítva!" });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba jelszó módosítás közben!", error: error.message });
  }
};

// Felhasználó törlése
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure user can only delete their own account unless they're an admin
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