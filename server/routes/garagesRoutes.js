const express = require("express");
const router = express.Router();
const garagesController = require("../Controller/garagesController");

router.get("/", garagesController.getAllGarages);
router.get("/:id", garagesController.getGarageById);
router.post("/", garagesController.createGarage);
router.put("/:id", garagesController.updateGarage);
router.delete("/:id", garagesController.deleteGarage);

// Schedule management routes
router.get("/:id/schedule", garagesController.getGarageSchedule);
router.put("/:id/schedule", garagesController.updateGarageSchedule);

// New route for getting available slots on a specific date
router.get("/:garageId/available-slots", garagesController.getAvailableSlots);

module.exports = router;