const express = require("express");
const {getUserDetails} = require("../controllers/authCodeforces")

const router = express.Router();
router.post("/getCodeforcesData",  getUserDetails);

module.exports = router;
