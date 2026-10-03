const express = require("express");
const { getCodeforcesData } = require("../controllers/platformController/codeforcesController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/getCodeforcesData",
  authMiddleware,
  getCodeforcesData
);


module.exports = router;
