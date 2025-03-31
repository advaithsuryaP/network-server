const express = require("express");
const router = express.Router();

const metadataController = require("../controllers/metadata.controller");

router.get("/countries", metadataController.getCountries);

module.exports = router;
