const { Server } = require("socket.io");

let io;

// Track users in rooms
const roomUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /* ===== CHAT ===== */
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", (data) => {
      io.to(data.chatId).emit("receive-message", data);
    });

    socket.on("edit-message", ({ chatId, messageId, newText }) => {
      io.to(chatId).emit("message-edited", {
        chatId,
        messageId,
        newText,
      });
    });

    socket.on("delete-chat", ({ chatId }) => {
      io.to(chatId).emit("chat-deleted", { chatId });
    });

    /* ===== POSTS / COMMENTS ===== */
    socket.on("join-post", (postId) => {
      socket.join(postId);
    });

    /* ===== CODE LAB - Room Management ===== */
    socket.on("join-code-room", ({ roomId, user }) => {
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId).set(socket.id, user);

      // Notify others in room
      socket.to(roomId).emit("user-joined", { user, socketId: socket.id });

      // Send current users to the joining user
      const users = Array.from(roomUsers.get(roomId).entries()).map(([sid, u]) => ({
        socketId: sid,
        user: u,
      }));
      socket.emit("room-users", users);

      console.log(`👤 User ${user.username} joined room ${roomId}`);
    });

    socket.on("leave-code-room", ({ roomId }) => {
      socket.leave(roomId);
      if (roomUsers.has(roomId)) {
        const user = roomUsers.get(roomId).get(socket.id);
        roomUsers.get(roomId).delete(socket.id);
        socket.to(roomId).emit("user-left", { socketId: socket.id, user });
      }
    });

    /* ===== CODE LAB - Code Sync ===== */
    socket.on("code-change", ({ roomId, code, userId }) => {
      socket.to(roomId).emit("code-update", { code, userId });
    });

    socket.on("language-change", ({ roomId, language }) => {
      socket.to(roomId).emit("language-update", { language });
    });

    socket.on("cursor-change", ({ roomId, cursor, userId, username }) => {
      socket.to(roomId).emit("cursor-update", { cursor, userId, username });
    });

    /* ===== CODE LAB - Video Calling (WebRTC Signaling) ===== */
    socket.on("webrtc-offer", ({ to, offer, from }) => {
      io.to(to).emit("webrtc-offer", { offer, from });
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
      io.to(to).emit("webrtc-answer", { answer });
    });

    socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("webrtc-ice-candidate", { candidate });
    });

    socket.on("end-call", ({ roomId }) => {
      socket.to(roomId).emit("call-ended");
    });

    socket.on("toggle-video", ({ roomId, enabled }) => {
      socket.to(roomId).emit("peer-video-toggle", { socketId: socket.id, enabled });
    });

    socket.on("toggle-audio", ({ roomId, enabled }) => {
      socket.to(roomId).emit("peer-audio-toggle", { socketId: socket.id, enabled });
    });

    /* ===== CODE LAB - Session Chat ===== */
    socket.on("session-message", ({ roomId, message }) => {
      io.to(roomId).emit("session-message", message);
    });

    /* ===== CODE LAB - Whiteboard ===== */
    socket.on("draw-stroke", ({ roomId, stroke }) => {
      socket.to(roomId).emit("draw-stroke", { stroke });
    });

    socket.on("clear-whiteboard", ({ roomId }) => {
      socket.to(roomId).emit("whiteboard-cleared");
    });

    /* ===== DISCONNECT ===== */
    socket.on("disconnect", () => {
      // Clean up from all rooms
      roomUsers.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          const user = users.get(socket.id);
          users.delete(socket.id);
          io.to(roomId).emit("user-left", { socketId: socket.id, user });
        }
      });
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };

