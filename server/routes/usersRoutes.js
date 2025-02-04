const express = require("express");
const router = express.Router();
const usersController = require("../Controller/usersController");

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);

module.exports = router;
