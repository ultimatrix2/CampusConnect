const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const { communityUpload } = require("../middleware/upload.middleware");
const { createPost, getAllPosts, deletePost, toggleLikePost, getTrendingTags } = require("../controllers/postController"); // ✅ Fixed casing
const { getLinkPreview } = require("../controllers/linkPreviewController");

console.log("communityUpload:", communityUpload);
console.log("authMiddleware:", authMiddleware);

router.post("/create", authMiddleware, communityUpload, createPost);
router.get("/", authMiddleware, getAllPosts);
router.delete("/delete/:postId", authMiddleware, deletePost);
router.post("/like/:postId", authMiddleware, toggleLikePost);

// 🆕 New Features
router.get("/trending", authMiddleware, getTrendingTags);
router.post("/link-preview", authMiddleware, getLinkPreview);

module.exports = router;
