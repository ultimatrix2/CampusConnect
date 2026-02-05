const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");


const {

  sendMessage,
  editMessage,
  deleteMessage,
  createNewChat,
  getAllChats,
  clearChat,
  markMessagesRead,
} = require("../controllers/chatController");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const upload = multer({ storage: storage });

router.post("/create-new-chat", authMiddleware, createNewChat);
router.get("/get-all-chats", authMiddleware, getAllChats);

router.post(
  "/send-message",
  authMiddleware,
  upload.single("file"),
  (req, res, next) => {
    console.log("✅ /send-message route hit");
    next();
  },
  sendMessage
);
router.put("/edit-message", authMiddleware, editMessage);
router.delete("/delete-message", authMiddleware, deleteMessage);
router.post("/clear-chat", authMiddleware, clearChat);
router.put("/mark-read", authMiddleware, markMessagesRead);


module.exports = router;
