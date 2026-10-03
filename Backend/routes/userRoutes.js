const router = require("express").Router();
const authMiddleware = require("./../middleware/authMiddleware");
const userController = require("./../controllers/userController");
const upload = require("../config/multer");
const User = require("../models/User");

// USER ROUTES 
router.get("/me", authMiddleware, userController.getMe);

router.get(
  "/get-logged-user",
  authMiddleware,
  userController.getLoggedUser
);

router.get(
  "/get-all-users",
  authMiddleware,
  (req, res, next) => {
    next();
  },
  userController.getAllUsers
);

router.put(
  "/update-profile",
  authMiddleware,

  (req, res, next) => {
    next();
  },

  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),

  (req, res, next) => {
    console.log(" [MULTER] req.body:", req.body);
    console.log(" [MULTER] req.files:", req.files);
    next();
  },
  userController.updateProfile
);



router.put(
  "/update-leetcode",
  authMiddleware,


  userController.updateLeetcode
);

const leetcodeController = require("./../controllers/platformController/leetcodeController");

// ... existing code ...

router.post(
  "/leetcode",
  authMiddleware,
  leetcodeController.getLeetcodeData
);


// user count

router.get(
  "/count",
  authMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      console.log("Total users:", totalUsers);

      res.status(200).json({
        success: true,
        totalUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user count"
      });
    }
  }
);


module.exports = router;
