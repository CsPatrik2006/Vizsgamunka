const express = require("express");
const router = express.Router();
const work_ordersController = require("../Controller/work_ordersController");

router.get("/", work_ordersController.getAllWorkProcesses);
router.get("/:id", work_ordersController.getWorkProcessById);
router.post("/", work_ordersController.createWorkProcess);

module.exports = router;
