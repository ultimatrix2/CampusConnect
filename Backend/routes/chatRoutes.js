const express = require("express");
const { register, login } = require("../controllers/chatControllers.js");
// const { createNewChat } = require("../../Frontend/src/chatApiCalls/chat.js");

const router = express.Router();
router.post("/create-new-chat", createNewChat);
router.post("/get-all-chats", getAllChats);

module.exports = router;
