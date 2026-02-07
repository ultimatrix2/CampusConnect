import React, { useState, useRef, useEffect } from "react";
import socket from "../../socket";
import { Send, Smile } from "lucide-react";

const SessionChat = ({ roomId, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.on("session-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("session-message");
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            text: newMessage,
            sender: {
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
            },
            timestamp: new Date().toISOString(),
        };

        socket.emit("session-message", { roomId, message });
        setNewMessage("");
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="session-chat-container">
            <div className="chat-header">
                <span className="chat-icon">💬</span>
                <span>Session Chat</span>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender._id === user._id ? "own" : "other"
                                }`}
                        >
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="sender-name">
                                        {msg.sender._id === user._id ? "You" : msg.sender.username}
                                    </span>
                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                </div>
                                <p className="message-text">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default SessionChat;
