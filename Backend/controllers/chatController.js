const Chat = require("../models/Chat");
const { getIO } = require("../config/socket");
const mongoose = require("mongoose");

/* =========================
   SEND MESSAGE (TEXT / EMOJI)
   ========================= */



/* =========================
   GET ALL CHATS (Filtered by clearedAt)
   ========================= */
exports.getAllChats = async (req, res) => {
  try {
    const userId = req.user._id;
    let chats = await Chat.find({ members: userId })
      .populate("members", "name username profileImage")
      .sort({ updatedAt: -1 });

    // Filter messages based on clearedAt time
    chats = chats.map((chat) => {
      const chatObj = chat.toObject();
      const clearedTime = chat.clearedAt && chat.clearedAt.get(userId.toString());

      if (clearedTime) {
        chatObj.messages = chatObj.messages.filter(
          (m) => new Date(m.createdAt) > new Date(clearedTime)
        );
      }
      // Update last message preview if needed
      if (chatObj.messages.length > 0) {
        const lastMsg = chatObj.messages[chatObj.messages.length - 1];
        chatObj.lastMessage = lastMsg.text || (lastMsg.emoji ? "Emoji" : lastMsg.file ? "File" : "");
      } else {
        chatObj.lastMessage = "";
      }
      return chatObj;
    });

    res.json({ success: true, chats });
  } catch (err) {
    console.error("GetAllChats Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* =========================
   CREATE OR GET CHAT (Filtered)
   ========================= */
exports.createNewChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "UserId required" });
    }

    // 🔍 check if chat already exists
    let chat = await Chat.findOne({
      members: { $all: [userId, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [userId, otherUserId],
        messages: [],
      });
    }

    // Filter messages for response
    const chatObj = chat.toObject();
    const clearedTime = chat.clearedAt && chat.clearedAt.get(userId.toString());
    if (clearedTime) {
      chatObj.messages = chatObj.messages.filter(m => new Date(m.createdAt) > new Date(clearedTime));
    }

    res.json({ success: true, chat: chatObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================
   SEND MESSAGE
   ========================= */
exports.sendMessage = async (req, res) => {
  try {
    // Check if file upload (multer)
    let fileUrl = null;
    let fileType = null;

    // If using multer-storage-cloudinary, req.file.path is the URL
    if (req.file) {
      fileUrl = req.file.path;
      fileType = req.file.mimetype;
    }

    const { chatId, text, emoji } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    let messageType = "text";
    if (fileUrl) messageType = "file";
    else if (emoji) messageType = "emoji";

    const messageData = {
      sender: req.user._id,
      messageType,
    };

    if (text) messageData.text = text;
    if (emoji) messageData.emoji = emoji;
    if (fileUrl) messageData.file = fileUrl;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: messageData },
        lastMessage: text || (emoji ? "Emoji" : "File"),
      },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = updatedChat.messages.at(-1);

    getIO().to(chatId).emit("receive-message", {
      chatId,
      ...newMessage.toObject(),
    });

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error("🔥 sendMessage ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================
   CLEAR CHAT
   ========================= */
exports.clearChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Set clearedAt for this user to NOW
    if (!chat.clearedAt) chat.clearedAt = new Map();
    chat.clearedAt.set(userId.toString(), new Date());

    await chat.save();

    res.json({ success: true, message: "Chat cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


/* =========================
   EDIT MESSAGE
   ========================= */
exports.editMessage = async (req, res) => {
  try {
    const { chatId, messageId, newText } = req.body;

    await Chat.updateOne(
      { _id: chatId, "messages._id": messageId },
      {
        $set: {
          "messages.$.text": newText,
          "messages.$.edited": true,
        },
      }
    );

    // 🔥 Emit socket event
    getIO().to(chatId).emit("message-edited", {
      chatId,
      messageId,
      newText,
    });

    res.json({
      success: true,
      message: "Message edited",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   DELETE MESSAGE
   ========================= */
exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.body;

    await Chat.findByIdAndUpdate(chatId, {
      $pull: { messages: { _id: messageId } },
    });

    // 🔥 Emit socket event
    getIO().to(chatId).emit("message-deleted", {
      chatId,
      messageId,
    });

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   MARK MESSAGES AS READ
   ========================= */
exports.markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    // Update messages in this chat where:
    // 1. Sender is NOT me (others sent them)
    // 2. Read is false
    await Chat.updateOne(
      { _id: chatId },
      {
        $set: { "messages.$[elem].read": true },
      },
      {
        arrayFilters: [{ "elem.sender": { $ne: userId }, "elem.read": false }],
      }
    );

    // Emit socket event to notify sender(s) that messages were read
    getIO().to(chatId).emit("messages-read", {
      chatId,
      readBy: userId
    });

    res.json({ success: true });
  } catch (error) {
    console.error("markMessagesRead Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
