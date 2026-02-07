import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, LogIn, Copy, Check } from "lucide-react";
import axios from "axios";

const RoomDialog = ({ user, onRoomJoin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create"); // "create" or "join"
    const [roomName, setRoomName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [createdRoom, setCreatedRoom] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            setError("Please enter a room name");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5001/api/code-session/create",
                {
                    name: roomName,
                    hostId: user._id,
                }
            );

            if (response.data.success) {
                setCreatedRoom(response.data.room);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create room");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!roomCode.trim()) {
            setError("Please enter a room code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5001/api/code-session/join",
                {
                    roomId: roomCode,
                    userId: user._id,
                }
            );

            if (response.data.success) {
                onRoomJoin(response.data.room, response.data.isHost);
                setIsOpen(false);
                resetForm();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to join room");
        } finally {
            setLoading(false);
        }
    };

    const handleEnterRoom = () => {
        if (createdRoom) {
            onRoomJoin(createdRoom, true);
            setIsOpen(false);
            resetForm();
        }
    };

    const copyRoomCode = () => {
        if (createdRoom) {
            navigator.clipboard.writeText(createdRoom.roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const resetForm = () => {
        setRoomName("");
        setRoomCode("");
        setCreatedRoom(null);
        setError("");
        setMode("create");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="room-dialog-trigger">
                    <Plus size={18} />
                    Start Session
                </Button>
            </DialogTrigger>
            <DialogContent className="room-dialog-content">
                <DialogHeader>
                    <DialogTitle>
                        {createdRoom ? "Room Created!" : "Start a Coding Session"}
                    </DialogTitle>
                    <DialogDescription>
                        {createdRoom
                            ? "Share this code with your partner"
                            : "Create a new room or join an existing one"}
                    </DialogDescription>
                </DialogHeader>

                {createdRoom ? (
                    <div className="room-created">
                        <div className="room-code-display">
                            <span className="room-code">{createdRoom.roomId}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={copyRoomCode}
                                className="copy-btn"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </Button>
                        </div>
                        <p className="room-name">{createdRoom.name}</p>
                        <Button onClick={handleEnterRoom} className="enter-room-btn">
                            Enter Room
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mode-tabs">
                            <button
                                className={`mode-tab ${mode === "create" ? "active" : ""}`}
                                onClick={() => setMode("create")}
                            >
                                <Plus size={16} />
                                Create Room
                            </button>
                            <button
                                className={`mode-tab ${mode === "join" ? "active" : ""}`}
                                onClick={() => setMode("join")}
                            >
                                <LogIn size={16} />
                                Join Room
                            </button>
                        </div>

                        {mode === "create" ? (
                            <div className="form-group">
                                <Label htmlFor="roomName">Room Name</Label>
                                <Input
                                    id="roomName"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name..."
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <Label htmlFor="roomCode">Room Code</Label>
                                <Input
                                    id="roomCode"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 8-character code..."
                                    maxLength={8}
                                />
                            </div>
                        )}

                        {error && <p className="error-message">{error}</p>}

                        <Button
                            onClick={mode === "create" ? handleCreateRoom : handleJoinRoom}
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading
                                ? "Loading..."
                                : mode === "create"
                                    ? "Create Room"
                                    : "Join Room"}
                        </Button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RoomDialog;
