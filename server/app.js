const express = require("express");
const mongoose = require("mongoose");
const session = require("cookie-session");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
// const gameRoutes = require("./routes/games");

const app = express();
app.use(express.json());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.use(session({
  name: "session",
  keys: [process.env.SESSION_SECRET || "secret-key"],
  maxAge: 24 * 60 * 60 * 1000
}));


app.use("/api", authRoutes);
// app.use("/api/games", gameRoutes);


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(3001, () => console.log("Server running on http://localhost:3001"));
  })
    .catch(err => console.error(" MongoDB connection error:", err));
  

const gameRoutes = require("./routes/game");
app.use("/api/games", gameRoutes);