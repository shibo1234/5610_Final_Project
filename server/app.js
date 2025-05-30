const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gamesRankRoutes = require("./routes/gamesRank");
const gameRoutes = require("./routes/game");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: isProduction
      ? "https://shibozheng-xutan-project3.onrender.com"
      //   : "http://localhost:5173",
        : true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
  })
);

app.use("/api", authRoutes);
app.use("/api/gamesRank", gamesRankRoutes);
app.use("/api/games", gameRoutes);

const frontendDir = path.join(__dirname, "..", "battleship-game", "dist");
app.use(express.static(frontendDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
