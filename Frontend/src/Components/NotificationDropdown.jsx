import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/Components/ui/button";
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/notifications", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        if (isOpen && token) {
            fetchNotifications();
        }
    }, [isOpen, token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Polling every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const handleMarkRead = async (id) => {
        try {
            await fetch("http://localhost:5001/api/notifications/mark-read", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ notificationId: id })
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcceptRequest = async (e, notification) => {
        e.stopPropagation();
        try {
            const res = await fetch("http://localhost:5001/api/connections/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ requestId: notification.relatedId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Connection accepted!");
                handleMarkRead(notification._id);
                fetchNotifications(); // Refresh to update status if needed
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Error accepting request");
        }
    };

    const handleRejectRequest = async (e, notification) => {
        e.stopPropagation();
        try {
            const res = await fetch("http://localhost:5001/api/connections/reject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ requestId: notification.relatedId })
            });
            if (res.ok) {
                toast.success("Connection rejected");
                handleMarkRead(notification._id);
            }
        } catch (error) {
            toast.error("Error rejecting request");
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark all as read when opening (optional, or just mark specific ones on click)
    // For now, we will mark as read when they click the item or execute action.

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-white hover:bg-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-green-500 border border-slate-900 animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-200">Notifications</h3>
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`p-3 border-b border-slate-800/50 hover:bg-slate-800 transition-colors ${!notif.read ? 'bg-slate-800/30' : ''}`}
                                    onClick={() => !notif.read && handleMarkRead(notif._id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            {notif.sender && notif.sender.profileImage ? (
                                                <img src={notif.sender.profileImage} alt="" className="w-8 h-8 rounded-full bg-slate-700" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                    {notif.sender?.name?.[0] || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-300 break-words">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>

                                            {notif.type === 'connection_request' && !notif.read && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs"
                                                        onClick={(e) => handleAcceptRequest(e, notif)}
                                                    >
                                                        <Check className="w-3 h-3 mr-1" /> Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                                                        onClick={(e) => handleRejectRequest(e, notif)}
                                                    >
                                                        <X className="w-3 h-3 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
