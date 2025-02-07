const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
const userRouter = require('./controllers/userController.js');
const codeforcesRouter = require('./routes/routeCodeforces.js');
// const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');
const cors=require("cors");

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors(
   {
      origin: "http://localhost:3000", 
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }
));
// Routes 
app.use("/api/auth", authRoutes);

// routes for user log access
app.use('/api/user', userRouter);
app.use('/api/codeforces', codeforcesRouter);
app.use('/api/chat', chatRouter);

app.use('/api/chat' ,chatRouter);
app.use('/api/message', messageRouter);


mongoose.connect(process.env.MONGO_URL, {
}).then(() => console.log("MongoDB connected"))
.catch( err =>
   console.error(err)
);




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));