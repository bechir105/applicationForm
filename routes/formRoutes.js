const express = require("express");
const router = express.Router();
const { getFormStructure } = require("../controllers/formController");

router.get("/form-structure", getFormStructure);

module.exports = router;
