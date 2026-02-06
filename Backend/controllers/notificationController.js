const Notification = require("../models/Notification");

// Get notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch last 7 notifications
        console.log(`Fetching notifications for: ${userId}`);
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(7)
            .populate("sender", "name profileImage");

        console.log(`Found ${notifications.length} notifications`);
        res.status(200).json({ success: true, notifications });

    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching notifications." });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        await Notification.findByIdAndUpdate(notificationId, { read: true });

        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Mark all as read (optional utility)
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.status(200).json({ success: true, message: "All marked as read" });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
