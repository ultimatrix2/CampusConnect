import { useEffect, useState, useMemo, useRef } from "react";
import { DashboardLayout } from "../Components/DashboardLayout";
import socket from "../socket"; // socket.io-client file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, MoreVertical, Send, Check, Trash2, Edit2, X, MessageSquare, Users, Smile, Trash, Paperclip, CheckCheck } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const myUserId = user?._id;

  // Tabs: 'chats' or 'contacts'
  const [activeTab, setActiveTab] = useState("chats");

  // Data States
  const [users, setUsers] = useState([]); // All users (for Contacts)
  const [myChats, setMyChats] = useState([]); // My conversations (for Chats)

  // Selection States
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  // Message States
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [msgSearch, setMsgSearch] = useState(""); // Message search filter
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Edit/Delete States
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Emoji Picker State
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);

  // File Upload State
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Header Menu
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerMenuRef = useRef(null);

  // Search for Contacts/Chats Sidebar
  const [sidebarSearch, setSidebarSearch] = useState("");

  const userMap = useMemo(() => {
    return (users || []).reduce((acc, u) => {
      acc[u._id] = u.name;
      return acc;
    }, {});
  }, [users]);

  /* =========================
     CLICK OUTSIDE HANDLERS
     ========================= */
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setShowHeaderMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================
     SCROLL TO BOTTOM
     ========================= */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChat]);

  /* =========================
     INITIAL DATA FETCHING
     ========================= */
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchMyChats();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/get-all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Filter out myself
      const otherUsers = Array.isArray(data.data)
        ? data.data.filter(u => u._id !== myUserId)
        : [];
      setUsers(otherUsers);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsers([]);
    }
  };

  const fetchMyChats = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/chat/get-all-chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        setMyChats(data.chats);
      } else {
        setMyChats([]);
      }
    } catch (err) {
      console.error("Fetch my chats error:", err);
      setMyChats([]);
    }
  };

  /* =========================
     MARK READ HELPER
     ========================= */
  const markChatRead = async (chatId) => {
    try {
      await fetch("http://localhost:5001/api/chat/mark-read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ chatId })
      });
      // Do not manually update state here; wait for socket event or rely on optimistic update if critical
    } catch (err) {
      console.error("Mark read error", err);
    }
  };

  /* =========================
     SOCKET LISTENERS
     ========================= */
  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      const { chatId } = newMsg;

      // 1. Update messages if looking at this chat
      if (currentChat && currentChat._id === chatId) {
        setMessages((prev) => [...(prev || []), newMsg]);

        // If I am looking at it, mark it as read immediately
        if (newMsg.sender !== myUserId) {
          markChatRead(chatId);
        }
      }

      // 2. Refresh lists
      fetchMyChats();
    };

    const handleMessageEdited = ({ messageId, newText, chatId }) => {
      if (currentChat && currentChat._id === chatId) {
        setMessages((prev) =>
          (prev || []).map((msg) =>
            msg._id === messageId ? { ...msg, text: newText, edited: true } : msg
          )
        );
      }
      fetchMyChats();
    };

    const handleMessageDeleted = ({ messageId, chatId }) => {
      if (currentChat && currentChat._id === chatId) {
        setMessages((prev) => (prev || []).filter((msg) => msg._id !== messageId));
      }
      fetchMyChats();
    };

    const handleMessagesRead = ({ chatId, readBy }) => {
      if (currentChat && currentChat._id === chatId) {
        // Update all my messages to read = true (since other person read them)
        setMessages(prev => prev.map(msg => {
          if (msg.sender === myUserId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        }));
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-edited", handleMessageEdited);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("messages-read", handleMessagesRead);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-edited", handleMessageEdited);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("messages-read", handleMessagesRead);
    };
  }, [currentChat]);

  /* =========================
     ACTIONS
     ========================= */
  const handleSelectUser = async (user) => {
    // Check if we already have a chat with this user
    // STRICT comparison using toString() to be safe
    const exiting = (myChats || []).find(c =>
      c.members && c.members.some(m => m._id === user._id || m._id.toString() === user._id.toString())
    );

    if (exiting) {
      handleSelectChat(exiting);
      setActiveTab("chats");
      return;
    }

    try {
      // Create new chat
      const res = await fetch("http://localhost:5001/api/chat/create-new-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentChat(data.chat);
        setMessages(data.chat.messages || []);
        socket.emit("join-chat", data.chat._id);

        // Find the "other" user logic for sidebar highlighting
        setSelectedUser(user);

        // Refresh and switch tab
        await fetchMyChats();
        setActiveTab("chats");
      }
    } catch (err) {
      console.error("Create chat error:", err);
    }
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);

    // Find the "other" user
    // Normalize IDs for comparison
    const other = chat.members ? chat.members.find(m => m._id !== myUserId && m._id.toString() !== myUserId?.toString()) : null;
    if (other) setSelectedUser(other);

    socket.emit("join-chat", chat._id);

    // Mark as Read
    markChatRead(chat._id);
  };

  const handleSendMessage = async () => {
    if ((!message.trim()) || !currentChat) return;

    try {
      await fetch("http://localhost:5001/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: currentChat._id,
          text: message,
        }),
      });
      setMessage("");
      setShowEmoji(false);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // Upload Logic
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUploadFile(file);
    }
    // Reset inputs
    e.target.value = "";
  };

  const handleUploadFile = async (file) => {
    if (!currentChat) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", currentChat._id);

    try {
      const res = await fetch("http://localhost:5001/api/chat/send-message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually for FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Optimistic / rely on socket? 
      // Socket should handle the receive-message event to propagate the file
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleEditMessage = async (msgId) => {
    if (!editedText.trim()) return;
    await fetch("http://localhost:5001/api/chat/edit-message", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: currentChat._id,
        messageId: msgId,
        newText: editedText,
      }),
    });
    setEditingMsgId(null);
    setEditedText("");
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    await fetch("http://localhost:5001/api/chat/delete-message", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: currentChat._id,
        messageId: msgId,
      }),
    });
    // Optimistic update
    setMessages((prev) => prev.filter(m => m._id !== msgId));
    toast.success("Message deleted");
  };

  const handleClearChat = async () => {
    if (!currentChat) return;
    if (!window.confirm("Are you sure you want to clear the chat? This will remove all messages for you.")) return;

    try {
      const res = await fetch("http://localhost:5001/api/chat/clear-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId: currentChat._id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([]);
        toast.success("Chat cleared");
        fetchMyChats(); // Refresh last message preview in list
      } else {
        toast.error(data.message || "Failed to clear chat");
      }
    } catch (err) {
      console.error("Clear Chat Error", err);
      toast.error("Something went wrong");
    }
    setShowHeaderMenu(false);
  }

  /* =========================
     RENDERING HELPERS
     ========================= */

  // Filter Sidebar Items
  const filteredContacts = (users || []).filter(u => u.name?.toLowerCase().includes((sidebarSearch || "").toLowerCase()));

  const filteredChats = (myChats || []).filter(c => {
    // Normalize logic
    const other = c.members ? c.members.find(m => m._id !== myUserId && m._id.toString() !== myUserId?.toString()) : null;
    return other?.name?.toLowerCase().includes((sidebarSearch || "").toLowerCase());
  });

  // Filter Messages
  const visibleMessages = (messages || []).filter(m => {
    if (!msgSearch) return true;
    return m.text?.toLowerCase().includes(msgSearch.toLowerCase());
  });

  const getUnreadCount = (chat) => {
    if (!chat || !chat.messages) return 0;
    // Count messages not read by me and sent by other
    return (chat.messages || []).filter(m => !m.read && m.sender !== myUserId).length;
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] w-full flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">

        {/* ================= SIDEBAR ================= */}
        <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col">

          {/* Header & Tabs */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab("chats")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "chats" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
              >
                <MessageSquare className="w-4 h-4" /> Chats
              </button>
              <button
                onClick={() => setActiveTab("contacts")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "contacts" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Users className="w-4 h-4" /> Contacts
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={activeTab === 'chats' ? "Search conversations..." : "Search people..."}
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 text-slate-300 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'contacts' ? (
              // CONTACTS LIST
              <div className="flex flex-col">
                {filteredContacts.length === 0 && <p className="text-center text-slate-500 py-8 text-sm">No contacts found</p>}
                {filteredContacts.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-slate-800/30 hover:bg-slate-800/50"
                  >
                    <div className="relative">
                      {u?.profileImage ? (
                        <img src={u.profileImage} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 ring-2 ring-slate-700">
                          {u?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">@{u.username || "user"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // CHATS LIST
              <div className="flex flex-col">
                {filteredChats.length === 0 && <p className="text-center text-slate-500 py-8 text-sm">No active chats</p>}
                {filteredChats.map((chat) => {
                  const other = chat.members ? chat.members.find(m => m._id !== myUserId && m._id.toString() !== myUserId?.toString()) : null;
                  const unread = getUnreadCount(chat);
                  const isActive = currentChat?._id === chat._id;
                  const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
                  const displayText = lastMsg ? (lastMsg.text || (lastMsg.emoji ? "Emoji" : lastMsg.file ? "File" : "Attachment")) : "Start a conversation";

                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-slate-800/30
                          ${isActive ? "bg-slate-800/60 border-l-2 border-l-blue-500 pl-[14px]" : "hover:bg-slate-800/30 border-l-2 border-l-transparent"}`}
                    >
                      <div className="relative">
                        {other?.profileImage ? (
                          <img src={other.profileImage} alt={other.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 ring-2 ring-slate-700">
                            {other?.name?.charAt(0)}
                          </div>
                        )}
                        {/* Unread Badge */}
                        {unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-slate-900">
                            {unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`font-medium truncate text-sm ${isActive ? "text-white" : "text-slate-300"}`}>
                            {other?.name || "Unknown"}
                          </p>
                        </div>
                        <p className={`text-xs truncate ${unread > 0 ? "text-slate-200 font-semibold" : "text-slate-500"}`}>
                          {displayText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ================= CHAT AREA ================= */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center ring-1 ring-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <p className="font-light">Select a user to start chatting</p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 shadow-sm z-20">
                <div className="flex items-center gap-3">
                  {selectedUser?.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 ring-2 ring-slate-700">
                      {selectedUser?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-slate-200 font-semibold text-sm">{selectedUser?.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-[11px] text-green-500 font-medium">Online</span>
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1">
                  {showMsgSearch ? (
                    <div className="flex items-center bg-slate-800 rounded-full px-3 py-1 animate-in fade-in slide-in-from-right-4 duration-200">
                      <Search className="w-3 h-3 text-slate-400 mr-2" />
                      <input
                        autoFocus
                        value={msgSearch}
                        onChange={(e) => setMsgSearch(e.target.value)}
                        placeholder="Find in chat..."
                        className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-32"
                      />
                      <button onClick={() => { setShowMsgSearch(false); setMsgSearch(""); }} className="ml-2 text-slate-400 hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setShowMsgSearch(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                      <Search className="w-5 h-5" />
                    </button>
                  )}

                  {/* MORE MENU */}
                  <div className="relative" ref={headerMenuRef}>
                    <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showHeaderMenu && (
                      <div className="absolute right-0 top-12 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button
                          onClick={handleClearChat}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-2 transition-colors"
                        >
                          <Trash className="w-4 h-4" /> Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MESSAGES LIST */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                {visibleMessages.length === 0 && visibleMessages.length !== messages.length && (
                  <button onClick={() => setMsgSearch('')} className="bg-slate-800 text-xs py-2 px-4 rounded-full mx-auto mb-4 text-slate-400 hover:text-white">Clear Search</button>
                )}

                {visibleMessages.length === 0 && !msgSearch && (
                  <div className="text-center text-slate-600 mt-10 text-sm">
                    {messages.length === 0 ? "No messages yet. Say hello! 👋" : "No messages found."}
                  </div>
                )}

                {visibleMessages.map((msg) => {
                  const isMine = msg.sender === myUserId;
                  const isFile = msg.messageType === "file" || msg.file;

                  return (
                    <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>

                        {/* Bubble */}
                        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200
                            ${isFile ? "bg-transparent p-0 shadow-none border-none" :
                            (isMine ? "bg-blue-600 text-white rounded-br-none hover:bg-blue-600/90"
                              : "bg-slate-800 text-slate-200 rounded-bl-none hover:bg-slate-700")}`}>

                          {!isMine && !isFile && (
                            <div className="text-[10px] font-bold opacity-50 mb-1 text-slate-400">
                              {userMap[msg.sender]}
                            </div>
                          )}

                          {isFile ? (
                            <div className="rounded-xl overflow-hidden border border-slate-700 max-w-[250px] shadow-lg">
                              <img src={msg.file} alt="attachment" className="w-full h-auto object-cover" />
                            </div>
                          ) : (
                            <>
                              {editingMsgId === msg._id ? (
                                <div className="flex gap-2 items-center min-w-[200px]">
                                  <input
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    onKeyDown={(e) => {
                                      e.stopPropagation();
                                      if (e.key === "Enter") handleEditMessage(msg._id);
                                      if (e.key === "Escape") { setEditingMsgId(null); setEditedText(""); }
                                    }}
                                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full focus:outline-none focus:border-blue-500 text-xs"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button onClick={(e) => { e.stopPropagation(); handleEditMessage(msg._id); }} className="text-green-400 hover:text-green-300"><Check className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingMsgId(null); }} className="text-slate-400 hover:text-slate-300"><X className="w-3 h-3" /></button>
                                </div>
                              ) : (
                                <>
                                  <div className="break-words font-light">{msg.text}</div>
                                  {msg.edited && <span className="text-[9px] opacity-60 italic block text-right mt-0.5">(edited)</span>}
                                </>
                              )}
                            </>
                          )}
                        </div>

                        {/* Footer / Status */}
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] text-slate-500">
                            {/* {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} •  */}
                            {/* {msg.read ? "Seen" : "Delivered"} */}
                          </span>

                          {isMine && (
                            <div className="flex items-center">
                              {msg.read ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-500" />
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          {isMine && !isFile && editingMsgId !== msg._id && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => { setEditingMsgId(msg._id); setEditedText(msg.text); }} className="text-slate-500 hover:text-blue-400 transition-colors">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteMessage(msg._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {/* For file, allow delete only */}
                          {isMine && isFile && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => handleDeleteMessage(msg._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Dummy div for scrolling */}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 relative">
                {isUploading && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-xs font-semibold backdrop-blur-sm animate-pulse">
                    Uploading image...
                  </div>
                )}

                {showEmoji && (
                  <div ref={emojiRef} className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl border border-slate-700">
                    <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} width={300} height={400} />
                  </div>
                )}

                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 shadow-inner">
                  <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* File Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !fileInputRef.current?.value} // Disable if no text AND no file (tho file is instant)
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                  >
                    <Send className="w-4 h-4 transform" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{ backgroundColor: '#1e293b', color: '#fff' }}
      />
    </DashboardLayout>
  );
}

export default Chat;
