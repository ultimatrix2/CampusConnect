const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

// 🔥 REQUIRED: define this BEFORE middleware
async function cascadeDelete(post) {
  if (!post) return;

  // delete comments
  await mongoose.model("Comment").deleteMany({ postId: post._id });

  // delete media from cloudinary
  if (post.media?.publicId) {
    await cloudinary.uploader.destroy(post.media.publicId, {
      resource_type:
        post.media.type === "image"
          ? "image"
          : post.media.type === "video"
            ? "video"
            : "raw",
    });
  }
}
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true
    },

    tags: {
      type: [String],
      index: true // 📈 Scalable indexing
    },

    linkPreview: {
      url: String,
      title: String,
      description: String,
      image: String,
      domain: String
    },

    media: {
      type: {
        type: String, // image | video | file
        enum: ["image", "video", "file"],
      },
      url: {
        type: String // Cloudinary URL
      },
      publicId: {
        type: String // Cloudinary public_id (for delete)
      }
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isAnonymous: {
      type: Boolean,
      default: false
    },

    anonymousName: {
      type: String,
      default: "Anonymous"
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    repliesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
// when using findByIdAndDelete / findOneAndDelete
postSchema.pre("findOneAndDelete", async function (next) {
  const post = await this.model.findOne(this.getQuery());
  await cascadeDelete(post);
  next();
});

// when using deleteOne
postSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
  const post = await this.model.findOne(this.getQuery());
  await cascadeDelete(post);
  next();
});
module.exports = mongoose.model("Post", postSchema);
