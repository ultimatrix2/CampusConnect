const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Send a connection request
exports.sendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, message: "You cannot connect with yourself." });
        }

        console.log(`Connection Request: Sender ${senderId} to Receiver ${receiverId}`);

        // Check if request already exists
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            console.log("Existing request found:", existingRequest);
            if (existingRequest.status === "pending") {
                // Check if notification exists, if not create one (Retry logic)
                const senderUser = await User.findById(senderId);

                // Try to find if we already notified them recently to avoid spam? 
                // For now, just send it. It fixes the "user didn't get notification" bug.

                await Notification.create({
                    recipient: receiverId,
                    sender: senderId,
                    type: "connection_request",
                    message: `You have a connection request from ${senderUser.name}`,
                    relatedId: existingRequest._id,
                    onModel: "ConnectionRequest"
                });

                return res.status(200).json({ success: true, message: "Request resent!" });
            }
            if (existingRequest.status === "accepted") {
                return res.status(400).json({ success: false, message: "You are already connected." });
            }
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            receiver: receiverId,
            status: "pending"
        });

        const savedRequest = await newRequest.save();
        console.log("Request saved:", savedRequest._id);

        // Create Notification for Receiver
        const senderUser = await User.findById(senderId);
        const notif = await Notification.create({
            recipient: receiverId,
            sender: senderId,
            type: "connection_request",
            message: `You have a connection request from ${senderUser.name}`,
            relatedId: savedRequest._id,
            onModel: "ConnectionRequest"
        });
        console.log("Notification created:", notif._id);

        res.status(201).json({ success: true, message: "Connection request sent!" });

    } catch (error) {
        console.error("Send Request Error:", error);
        res.status(500).json({ success: false, message: "Server error sending request." });
    }
};

// Get pending requests (received by current user)
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ConnectionRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "name email profileImage role branch");

        res.status(200).json({ success: true, requests });

    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching requests." });
    }
};

// Get requests sent by current user (to update UI status)
exports.getSentRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await ConnectionRequest.find({
            sender: userId
        }).select("receiver status");

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching sent requests" });
    }
};

// Accept a connection request
exports.acceptRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.body;

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            receiver: userId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or already handled." });
        }

        request.status = "accepted";
        await request.save();

        // Update User Connections
        await User.findByIdAndUpdate(request.sender, {
            $addToSet: { connections: request.receiver }
        });

        await User.findByIdAndUpdate(request.receiver, {
            $addToSet: { connections: request.sender }
        });

        // Notify Sender
        const receiverUser = await User.findById(userId);
        await Notification.create({
            recipient: request.sender,
            sender: userId,
            type: "info",
            message: `${receiverUser.name} accepted your connection request.`,
            relatedId: request._id,
            onModel: "ConnectionRequest"
        });

        res.status(200).json({ success: true, message: "Connection accepted!" });

    } catch (error) {
        console.error("Accept Request Error:", error);
        res.status(500).json({ success: false, message: "Server error accepting request." });
    }
};

// Reject a connection request
exports.rejectRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.body;

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            receiver: userId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        request.status = "rejected";
        await request.save();

        res.status(200).json({ success: true, message: "Connection rejected." });

    } catch (error) {
        console.error("Reject Request Error:", error);
        res.status(500).json({ success: false, message: "Server error rejecting request." });
    }
};

// Get accepted connections
exports.getAcceptedConnections = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate("connections", "name username email profileImage role branch");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, connections: user.connections });

    } catch (error) {
        console.error("Get Connections Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching connections." });
    }
};
