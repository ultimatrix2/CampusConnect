const mongoose = require("mongoose");
const Notification = require("./models/Notification");
const User = require("./models/User");
require("dotenv").config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    // Find all notifications
    const allNotifs = await Notification.find().sort({ createdAt: -1 }).limit(20);
    console.log("--- Latest 20 Notifications ---");
    allNotifs.forEach(n => {
        console.log(`[${n.createdAt}] To: ${n.recipient}, From: ${n.sender}, Msg: ${n.message}`);
    });

    console.log("-------------------------------");

    // Check specific users if you know their names (optional)
    const users = await User.find().select("name email _id");
    console.log("--- Users ---");
    users.forEach(u => {
        console.log(`${u.name} (${u.email}): ${u._id}`);
    });

    process.exit();
}

run();
