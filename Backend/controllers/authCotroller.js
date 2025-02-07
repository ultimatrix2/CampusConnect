const User = require("./../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
//
            // this is working properly 
//
// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User

exports.register = async (req, res) => {
    try {
        const { name, gemail, email, password, confirmPassword, branch } = req.body;

        if(!gemail.endsWith("@mnnit.ac.in"))
        {
            return res.status(400).json({ message: "Gsuite mail must be a valid MNNIT email (e.g., example@mnnit.ac.in" });
        }
        
        if (!email.endsWith("@gmail.com") && !email.endsWith("@hotmail.com")) {
            return res.status(400).json({ message: "Email must be a valid Gmail or Hotmail address" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists." });
        }
 
        const newUser = new User({ name, gemail, email, password, branch });
        await newUser.save();

        const token = generateToken(newUser);
        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        
       // if(user.email)
        if (!user) {
            return res.status(400).json({ message: "Register First." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user);
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
