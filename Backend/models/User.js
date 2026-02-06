const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gemail: {
    type: String,
    unique: true,
    sparse: true, // ⭐ IMPORTANT
    validate: {
      validator: function (email) {
        if (!email) return true; // allow null
        return email.endsWith("@mnnit.ac.in");
      },
      message: "Gemail must be a valid MNNIT email"
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid email address"]
  },
  password: {
    type: String,
    minlength: 6
  },
  branch: {
    type: String,
    default: null
  },
  college: { type: String, default: null },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  profileImage: {
    type: String, // Cloudinary URL
    default: null,
  },

  resumeUrl: {
    type: String, // Cloudinary PDF URL
    default: null,
  },

  /* ================= SOCIAL LINKS ================= */
  github: { type: String, default: null },
  linkedin: { type: String, default: null },
  // (Optional)
  codeforcesUsername: {
    type: String,

    sparse: true
  },

  codeforcesRating: {
    type: Number,
    default: 0  // 
  },
  // LeetCode Info
  leetcodeUsername: {
    type: String,

    sparse: true
  },
  leetcodeRating: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    default: null
  },

  skills: [
    {
      type: String,
    },
  ],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],


}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
