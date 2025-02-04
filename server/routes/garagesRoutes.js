const express = require("express");
const router = express.Router();
const garagesController = require("../Controller/garagesController");

router.get("/", garagesController.getAllGarages);
router.get("/:id", garagesController.getGarageById);
router.post("/", garagesController.createGarage);

module.exports = router;