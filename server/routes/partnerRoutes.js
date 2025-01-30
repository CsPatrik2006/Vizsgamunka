const express = require("express");
const router = express.Router();
const partnerController = require("../Controller/partnerController");

router.get("/", partnerController.getAllPartners);
router.get("/:id", partnerController.getPartnerById);
router.post("/", partnerController.createPartner);

module.exports = router;
