const { getIO } = require("../config/socket");
const Post = require("../models/Post");

const uploadToCloudinary = require("../utils/cloudinaryUpload");


exports.createPost = async (req, res) => {
  console.log("\n================= CREATE POST API CALLED =================");
  try {
    const { content, isAnonymous } = req.body;


    // ❌ Block empty post FIRST
    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or file"
      });
    }

    // 🔥 BAD WORD FILTER (Local)
    const badWords = ["abuse", "kill", "murder", "hate", "stupid", "idiot", "die", "death", "racist", "terrorist"]; // Add more as needed
    if (content) {
      const lowerContent = content.toLowerCase();
      const hasBadWord = badWords.some(word => lowerContent.includes(word));

      if (hasBadWord) {
        return res.status(400).json({
          success: false,
          code: "CONTENT_BLOCK",
          message: "This post contains restricted words. Please keep the community safe."
        });
      }
    }

    let media = null;

    // ✅ Handle file upload
    if (req.file) {
      let folder = "community/files";
      let mediaType = "file";

      if (req.file.mimetype.startsWith("image")) {
        folder = "community/images";
        mediaType = "image";
      } else if (req.file.mimetype.startsWith("video")) {
        folder = "community/videos";
        mediaType = "video";
      } else {
        folder = "community/docs";  // ⭐ use docs, not files
        mediaType = "file";
      }

      const result = await uploadToCloudinary(req.file, folder);
      console.log("☁️ Cloudinary result:", result);

      media = {
        type: mediaType,
        url: result.url,
        publicId: result.publicId
      };
    }


    // 🏷️ Extract Tags
    const tags = content ? (content.match(/#[a-zA-Z0-9_]+/g) || []).map(tag => tag.toLowerCase()) : [];

    const post = await Post.create({
      content: content?.trim() || "",
      media,
      tags, // ✅ Save indexed tags
      postedBy: req.user._id,
      isAnonymous: isAnonymous === "true" || isAnonymous === true
    });

    const fullPost = await Post.findById(post._id).populate("postedBy", "name profileImage");

    // ⚡ Real-time Update
    getIO().emit("new-post", fullPost);
    res.status(201).json({ success: true, post: fullPost });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post"
    });
  }
};


exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "name profileImage") // adjust fields as per User model
      .sort({ createdAt: -1 });

    let totalLikes = 0;

    const formattedPosts = posts.map((post) => {
      const likesCount = post.likes.length;
      totalLikes += likesCount;
      return {
        _id: post._id,
        content: post.content,
        media: post.media,
        isAnonymous: post.isAnonymous,
        anonymousName: post.anonymousName,
        likes: post.likes,
        likesCount: post.likes.length,
        repliesCount: post.repliesCount,
        createdAt: post.createdAt,
        isMine: post.postedBy?._id.toString() === req.user._id.toString(), // ✅ Check ownership

        // 🔒 Hide identity if anonymous
        postedBy: post.isAnonymous
          ? { name: "Anonymous", profileImage: null }
          : post.postedBy
      };
    });

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      totalLikes,
      posts: formattedPosts
    });
  } catch (error) {
    console.error("Get All Posts Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community posts"
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    const userId = req.user._id;
    const post = await Post.findById(postId);

    console.log("USER:", req.user);
    console.log("POST ID:", req.params.postId);


    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // 🔐 OWNER CHECK
    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this post"
      });
    }


    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // 👎 DISLIKE (REMOVE LIKE)
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // 👍 LIKE
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
      postId
    });

  } catch (error) {
    console.error("❌ Toggle Like Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// 📈 Get Trending Tags (Scalable Aggregation)
exports.getTrendingTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: "$tags" }, // Deconstruct tags array
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }, // Sort by most frequent
      { $limit: 10 } // Top 10
    ]);

    const formattedTags = tags.map(t => ({ tag: t._id, count: t.count, label: t._id }));
    res.status(200).json({ success: true, tags: formattedTags });
  } catch (error) {
    console.error("Trending Tags Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trends" });
  }
};




