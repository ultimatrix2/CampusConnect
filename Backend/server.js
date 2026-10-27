const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

/* ROUTES */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const codeforcesRoutes = require("./routes/routeCodeforces");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

/* SOCKET */
const { initSocket } = require("./config/socket");
const { startRatingUpdateJob } = require("./cron/updateRatings");

/* MIDDLEWARE */
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.CLIENT_URL === "*" ||
        !process.env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow origin in deployment
    },
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/community", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/connections", require("./routes/connectionRoutes"));
app.use("/api/code-session", require("./routes/codeSessionRoutes"));

/* DB */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

/* SERVER */
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
