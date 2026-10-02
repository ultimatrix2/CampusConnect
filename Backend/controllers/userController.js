const User = require("./../models/User");
const axios = require("axios");
const cloudinary = require("../config/cloudinary");

/* ===================== GET LOGGED USER ===================== */
exports.getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET ALL USERS ===================== */
exports.getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* ===================== UPDATE CODEFORCES ===================== */

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ===== SAFE YEAR HANDLING =====
    if ("year" in req.body) {
      const parsedYear = Number(req.body.year);
      user.year = Number.isFinite(parsedYear) ? parsedYear : null;
    }

    // ===== SKILLS =====
    const skills =
      typeof req.body.skills === "string"
        ? req.body.skills.split(",").filter(Boolean)
        : req.body.skills || [];

    // ===== FILES =====
    let profileImageUrl = user.profileImage;
    if (req.files?.profileImage) {
      profileImageUrl = req.files.profileImage[0].path;
    }

    let resumeUrl = user.resumeUrl;
    if (req.files?.resume) {
      resumeUrl = req.files.resume[0].path;
    }

    // ===== BASIC INFO =====
    user.name = req.body.name || user.name;
    user.branch = req.body.branch || null;
    user.college = req.body.college || null;
    user.skills = skills;

    // ===== LINKS =====
    user.github = req.body.githubLink || user.github;
    user.linkedin = req.body.linkedinLink || user.linkedin;
    user.leetcodeUsername = req.body.leetcodeLink || user.leetcodeUsername;
    user.codeforcesUsername = req.body.codeforcesLink || user.codeforcesUsername;

    user.profileImage = profileImageUrl;
    user.resumeUrl = resumeUrl;



    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(" UPDATE PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/* ===================== LEETCODE GRAPHQL HELPER ===================== */
const getLeetcodeGraphqlResponse = async (query, variables) => {
  return axios.post(
    "https://leetcode.com/graphql/",
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/",
      },
    }
  );
};

/* ===================== UPDATE LEETCODE ===================== */
exports.updateLeetcode = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    if (!leetcodeUsername) {
      return res.status(400).json({
        success: false,
        message: "LeetCode username is required",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          profile { ranking }
        }
      }
    `;

    let response = await getLeetcodeGraphqlResponse(query, {
      username: leetcodeUsername,
    });

    if (!response.data.data.matchedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid LeetCode username" });
    }

    query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) { rating }
      }
    `;

    response = await getLeetcodeGraphqlResponse(query, {
      username: leetcodeUsername,
    });

    user.leetcodeUsername = leetcodeUsername;
    user.leetcodeRating =
      response.data.data.userContestRanking?.rating || 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "LeetCode profile updated successfully",
      data: {
        leetcodeUsername: user.leetcodeUsername,
        leetcodeRating: user.leetcodeRating,
      },

    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




