const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gamesRankRoutes = require("./routes/gamesRank");
const gameRoutes = require("./routes/game");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
    cookie: { secure: false }, // TODO: Unsure to update this to true if deploying with HTTPS
  })
);

app.use("/api", authRoutes);
app.use("/api/gamesRank", gamesRankRoutes);
app.use("/api/games", gameRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(3001, () =>
      console.log("Server running on http://localhost:3001")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
