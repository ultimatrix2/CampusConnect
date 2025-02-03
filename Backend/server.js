const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
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

mongoose.connect(process.env.MONGO_URL, {
}).then(() => console.log("MongoDB connected"))
.catch( err =>
   console.error(err)
);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));