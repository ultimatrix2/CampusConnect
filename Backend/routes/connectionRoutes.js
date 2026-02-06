const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", authMiddleware, connectionController.sendRequest);
router.get("/pending", authMiddleware, connectionController.getPendingRequests);
router.get("/sent", authMiddleware, connectionController.getSentRequests);
router.post("/accept", authMiddleware, connectionController.acceptRequest);
router.post("/reject", authMiddleware, connectionController.rejectRequest);
router.get("/accepted", authMiddleware, connectionController.getAcceptedConnections);

module.exports = router;
