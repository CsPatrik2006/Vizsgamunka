const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const usersController = require("../Controller/usersController");

// Middleware az autentikációhoz (JWT ellenőrzés)
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Nincs token, hozzáférés megtagadva!" });
    }

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Érvénytelen vagy lejárt token!" });
        }
        req.user = user;
        next();
    });
};

// Nyilvános végpontok (nem szükséges token)
router.post("/register", usersController.createUser); // Regisztráció
router.post("/login", usersController.authenticateUser); // Bejelentkezés

// Védett végpontok (autentikáció szükséges)
router.get("/users", authenticateToken, usersController.getAllUsers); // Összes felhasználó lekérése
router.get("/users/:id", authenticateToken, usersController.getUserById); // Egy felhasználó lekérése
router.put("/users/:id", authenticateToken, usersController.updateUser); // Felhasználó frissítése
router.delete("/users/:id", authenticateToken, usersController.deleteUser); // Felhasználó törlése

// Tesztelt védett végpont
router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Ez egy védett végpont!", user: req.user });
});

module.exports = router;
