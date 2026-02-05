const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
    },

    emoji: {
      type: String, // 😀 ❤️ 👍
    },

    file: {
      type: String, // file URL or filename
    },

    messageType: {
      type: String,
      enum: ["text", "emoji", "file"],
      default: "text",
    },

    edited: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [messageSchema],

    lastMessage: String,

    unreadMessageCount: {
      type: Number,
      default: 0,
    },

    clearedAt: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.chats || mongoose.model("chats", chatSchema);
