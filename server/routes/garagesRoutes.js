const express = require("express");
const router = express.Router();
const garagesController = require("../Controller/garagesController");

router.get("/", garagesController.getAllGarages);
router.get("/:id", garagesController.getGarageById);
router.post("/", garagesController.createGarage);
router.put("/:id", garagesController.updateGarage);
router.delete("/:id", garagesController.deleteGarage);

router.get("/:id/schedule", garagesController.getGarageSchedule);
router.put("/:id/schedule", garagesController.updateGarageSchedule);

router.get("/:garageId/available-slots", garagesController.getAvailableSlots);

module.exports = router;