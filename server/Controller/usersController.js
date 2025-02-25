const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Felhasznalo = require("../model/users");

// Regisztráció (Felhasználó létrehozása)
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Hiányzó kötelező mezők (név, email, szerep, jelszó)!" });
    }

    // Jelszó titkosítása
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Felhasznalo.create({
      name,
      email,
      phone,
      role,
      password: hashedPassword, // Mentjük a titkosított jelszót
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

    const user = await Felhasznalo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

    // JWT generálás
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ message: "Sikeres bejelentkezés!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba hitelesítés közben!", error: error.message });
  }
};

// Összes felhasználó lekérése
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Felhasznalo.findAll({
      attributes: ["id", "name", "email", "phone", "role"], // Jelszót nem adjuk vissza!
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba felhasználók lekérésekor!", error: error.message });
  }
};

// Felhasználó lekérése ID alapján
exports.getUserById = async (req, res) => {
  try {
    const user = await Felhasznalo.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }, // Jelszót kizárjuk a válaszból
    });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }
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

    // Ha a jelszó is frissül, titkosítjuk
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const [updated] = await Felhasznalo.update(updates, { where: { id } });
    if (!updated) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.json({ message: "Felhasználó sikeresen frissítve!" });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba frissítés közben!", error: error.message });
  }
};

// Felhasználó törlése
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Felhasznalo.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Felhasználó nem található!" });

    res.json({ message: "Felhasználó sikeresen törölve!" });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba törlés közben!", error: error.message });
  }
};
