const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplicationDetails,
  saveProgress,
  getApplicationProgress,
} = require("../controllers/applicationController");
const { authMiddleware, checkAuth } = require("../middleware/authMiddleware");

router.post("/application", authMiddleware, createApplication);
router.post("/application/save-progress", authMiddleware, saveProgress);
router.get(
  "/application/details/:userId/:stepId",
  authMiddleware,
  getApplicationDetails
);
router.get("/application/progress", checkAuth, getApplicationProgress);

module.exports = router;
