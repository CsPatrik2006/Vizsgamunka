const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const usersController = require("../Controller/usersController");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Csak képfájlok tölthetők fel!'), false);
    }
    cb(null, true);
  }
});

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
router.post("/users/:id/change-password", authenticateToken, usersController.changePassword); // Jelszó módosítása
router.delete("/users/:id", authenticateToken, usersController.deleteUser); // Felhasználó törlése

// New route for profile picture upload
router.post("/users/:id/profile-picture", authenticateToken, upload.single('profilePicture'), usersController.uploadProfilePicture);

// Serve profile pictures
router.use('/uploads/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures')));

// Tesztelt védett végpont
router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Ez egy védett végpont!", user: req.user });
});

module.exports = router;