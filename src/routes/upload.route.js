const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const controller = require("../controllers/upload.controller");

router.post("/upload", upload.single("audio"), controller.upload);

module.exports = router;