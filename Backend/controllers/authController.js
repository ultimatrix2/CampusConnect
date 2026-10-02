const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, gemail, email, password, confirmPassword, branch } = req.body;

    if (!gemail || !password || !confirmPassword) {
      return res.status(400).json({ message: "Gemail and password are required" });
    }

    if (!gemail.endsWith("@mnnit.ac.in")) {
      return res.status(400).json({ message: "Invalid MNNIT email" });
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@hotmail.com")) {
      return res.status(400).json({ message: "Invalid personal email" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      gemail,
      email,
      password,
      branch,
      authProvider: "local",
    });

    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ message: "Registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // allow login with either personal email or college gemail (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { gemail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
      ],
    });

    if (!user) return res.status(400).json({ message: "Register first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: "Login successful", token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

