const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

// Create a new room
router.post("/create", async (req, res) => {
    try {
        const { name, hostId } = req.body;

        if (!name || !hostId) {
            return res.status(400).json({ error: "Name and hostId are required" });
        }

        const roomId = uuidv4().substring(0, 8).toUpperCase();

        const room = new Room({
            roomId,
            name,
            host: hostId,
        });

        await room.save();

        res.status(201).json({
            success: true,
            room: {
                roomId: room.roomId,
                name: room.name,
                host: room.host,
                language: room.language,
                code: room.code,
            },
        });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ error: "Failed to create room" });
    }
});

// Join a room
router.post("/join", async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        if (!roomId || !userId) {
            return res.status(400).json({ error: "Room ID and userId are required" });
        }

        const room = await Room.findOne({ roomId: roomId.toUpperCase(), isActive: true });

        if (!room) {
            return res.status(404).json({ error: "Room not found or inactive" });
        }

        if (room.host.toString() === userId) {
            return res.json({ success: true, room, isHost: true });
        }

        if (room.participant && room.participant.toString() !== userId) {
            return res.status(403).json({ error: "Room is full (1-to-1 only)" });
        }

        if (!room.participant) {
            room.participant = userId;
            await room.save();
        }

        res.json({ success: true, room, isHost: false });
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ error: "Failed to join room" });
    }
});

// Get room details
router.get("/:roomId", async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() })
            .populate("host", "username profilePicture")
            .populate("participant", "username profilePicture");

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        res.json({ success: true, room });
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ error: "Failed to fetch room" });
    }
});

// Get user's rooms
router.get("/user/:userId", async (req, res) => {
    try {
        const rooms = await Room.find({
            $or: [
                { host: req.params.userId },
                { participant: req.params.userId }
            ],
            isActive: true,
        }).sort({ updatedAt: -1 });

        res.json({ success: true, rooms });
    } catch (error) {
        console.error("Error fetching user rooms:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

// Update room code/language (for persistence)
router.put("/:roomId", async (req, res) => {
    try {
        const { code, language } = req.body;
        const updates = {};

        if (code !== undefined) updates.code = code;
        if (language !== undefined) updates.language = language;

        const room = await Room.findOneAndUpdate(
            { roomId: req.params.roomId.toUpperCase() },
            updates,
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        res.json({ success: true, room });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ error: "Failed to update room" });
    }
});

// End/close a room
router.delete("/:roomId", async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate(
            { roomId: req.params.roomId.toUpperCase() },
            { isActive: false },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        res.json({ success: true, message: "Room closed" });
    } catch (error) {
        console.error("Error closing room:", error);
        res.status(500).json({ error: "Failed to close room" });
    }
});

module.exports = router;
