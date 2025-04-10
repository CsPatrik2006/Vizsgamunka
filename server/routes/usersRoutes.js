const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const usersController = require("../Controller/usersController");
const multer = require("multer");
const path = require("path");

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Csak képfájlok tölthetők fel!'), false);
    }
    cb(null, true);
  }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

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

router.post("/register", usersController.createUser);
router.post("/login", usersController.authenticateUser);

router.get("/users", authenticateToken, usersController.getAllUsers);
router.get("/users/:id", authenticateToken, usersController.getUserById);
router.put("/users/:id", authenticateToken, usersController.updateUser);
router.post("/users/:id/change-password", authenticateToken, usersController.changePassword);
router.delete("/users/:id", authenticateToken, usersController.deleteUser);

router.post("/users/:id/profile-picture", authenticateToken, upload.single('profilePicture'), usersController.uploadProfilePicture);

router.use('/uploads/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures')));

router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Ez egy védett végpont!", user: req.user });
});

module.exports = router;