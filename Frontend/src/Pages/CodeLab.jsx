import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "../Components/ui/resizable";
import CodeEditor from "../Components/CodeLab/CodeEditor";
import VideoCall from "../Components/CodeLab/VideoCall";
import SessionChat from "../Components/CodeLab/SessionChat";
import Whiteboard from "../Components/CodeLab/Whiteboard";
import RoomDialog from "../Components/CodeLab/RoomDialog";
import { DashboardLayout } from "../Components/DashboardLayout";
import socket from "../socket";
import { Code, Users, LogOut, Copy, Check } from "lucide-react";
import "./CodeLab.css";

const CodeLab = () => {
    const user = useSelector((state) => state.user.currentUser);

    const [room, setRoom] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [peerSocketId, setPeerSocketId] = useState(null);
    const [peerUser, setPeerUser] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (room) {
            // Join the socket room
            socket.emit("join-code-room", {
                roomId: room.roomId,
                user: {
                    _id: user._id,
                    username: user.username,
                    profilePicture: user.profilePicture,
                },
            });

            // Listen for other users
            socket.on("room-users", (users) => {
                const peer = users.find((u) => u.user._id !== user._id);
                if (peer) {
                    setPeerSocketId(peer.socketId);
                    setPeerUser(peer.user);
                }
            });

            socket.on("user-joined", ({ user: joinedUser, socketId }) => {
                if (joinedUser._id !== user._id) {
                    setPeerSocketId(socketId);
                    setPeerUser(joinedUser);
                }
            });

            socket.on("user-left", ({ socketId }) => {
                if (socketId === peerSocketId) {
                    setPeerSocketId(null);
                    setPeerUser(null);
                }
            });

            return () => {
                socket.emit("leave-code-room", { roomId: room.roomId });
                socket.off("room-users");
                socket.off("user-joined");
                socket.off("user-left");
            };
        }
    }, [room, user, peerSocketId]);

    const handleRoomJoin = (roomData, hostStatus) => {
        setRoom(roomData);
        setIsHost(hostStatus);
    };

    const leaveRoom = () => {
        if (room) {
            socket.emit("leave-code-room", { roomId: room.roomId });
        }
        setRoom(null);
        setIsHost(false);
        setPeerSocketId(null);
        setPeerUser(null);
    };

    const copyRoomCode = () => {
        if (room) {
            navigator.clipboard.writeText(room.roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <DashboardLayout>
            <div className="codelab-container">
                {!room ? (
                    // Landing view - no active room
                    <div className="codelab-landing">
                        <div className="landing-content">
                            <div className="landing-icon">
                                <Code size={64} />
                            </div>
                            <h1>CodeArena</h1>
                            <p>
                                let's code
                            </p>
                            <div className="features-grid">
                                <div className="feature-card">

                                    <h3>Code Editor</h3>
                                    <p>Real-time synchronized editing with Monaco</p>
                                </div>
                                <div className="feature-card">

                                    <h3>Video Call</h3>
                                    <p>Face-to-face communication via WebRTC</p>
                                </div>
                                <div className="feature-card">

                                    <h3>Session Chat</h3>
                                    <p>Quick messaging alongside your code</p>
                                </div>
                                <div className="feature-card">

                                    <h3>Whiteboard</h3>
                                    <p>Sketch ideas and explain concepts</p>
                                </div>
                            </div>
                            <RoomDialog user={user} onRoomJoin={handleRoomJoin} />
                        </div>
                    </div>
                ) : (
                    // Active room view
                    <div className="codelab-active">
                        {/* Room Header */}
                        <div className="room-header">
                            <div className="room-info">
                                <h2>{room.name}</h2>
                                <div className="room-code-badge" onClick={copyRoomCode}>
                                    <span>Code: {room.roomId}</span>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </div>
                            </div>
                            <div className="room-participants">
                                <Users size={18} />
                                <span>
                                    {peerUser
                                        ? `You & ${peerUser.username}`
                                        : "Waiting for partner..."}
                                </span>
                            </div>
                            <button className="leave-btn" onClick={leaveRoom}>
                                <LogOut size={18} />
                                Leave
                            </button>
                        </div>

                        {/* Main Resizable Layout */}
                        <div className="codelab-workspace">
                            <ResizablePanelGroup direction="horizontal" className="main-panels">
                                {/* Left Panel - Code + Whiteboard */}
                                <ResizablePanel defaultSize={70} minSize={40}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={60} minSize={20}>
                                            <CodeEditor
                                                roomId={room.roomId}
                                                userId={user._id}
                                                initialCode={room.code}
                                                initialLanguage={room.language}
                                            />
                                        </ResizablePanel>
                                        <ResizableHandle withHandle />
                                        <ResizablePanel defaultSize={40} minSize={20}>
                                            <Whiteboard roomId={room.roomId} isHost={isHost} />
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Right Panel - Video + Chat */}
                                <ResizablePanel defaultSize={30} minSize={20}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={50} minSize={20}>
                                            <VideoCall
                                                roomId={room.roomId}
                                                user={user}
                                                peerSocketId={peerSocketId}
                                            />
                                        </ResizablePanel>
                                        <ResizableHandle withHandle />
                                        <ResizablePanel defaultSize={50} minSize={20}>
                                            <SessionChat roomId={room.roomId} user={user} />
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CodeLab;
