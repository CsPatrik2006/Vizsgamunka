const express = require("express");
const router = express.Router();
const servicesController = require("../Controller/servicesController");

router.get("/", servicesController.getAllServices);
router.get("/:id", servicesController.getServiceById);
router.post("/", servicesController.createService);

module.exports = router;
