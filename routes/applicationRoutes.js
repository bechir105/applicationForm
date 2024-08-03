const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplicationDetails,
} = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/application", authMiddleware, createApplication);
router.get(
  "/application/details/:userId/:stepId",
  authMiddleware,
  getApplicationDetails
);

module.exports = router;
