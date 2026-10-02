const express = require("express");
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  addReply,
  editReply,
  deleteReply,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//  COMMENTS  

// Create comment on a post
router.post("/:postId", authMiddleware, createComment);

// Get all comments of a post
router.get("/:postId", getCommentsByPost);

// Edit comment
router.put("/edit/:commentId", authMiddleware, updateComment);


// Delete comment
router.delete("/delete/:commentId", authMiddleware, deleteComment);

//  REPLIES 

// Add reply to a comment
router.post("/:commentId/reply", authMiddleware, addReply);

// Edit reply
router.put("/:commentId/reply/:replyId", authMiddleware, editReply);

// Delete reply
router.delete("/:commentId/reply/:replyId", authMiddleware, deleteReply);

module.exports = router;
