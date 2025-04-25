const express = require("express");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).send("Username already exists.");

    const user = new User({ username, password });
    await user.save();

    req.session.user = { id: user._id, username: user.username };
    res.status(201).json(req.session.user);
  } catch (err) {
    console.error("Registration error:", err); // debugging
    res.status(500).send("Registration failed.");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send("Invalid credentials.");
    }

    req.session.user = { id: user._id, username: user.username };
    res.json(req.session.user);
  } catch (err) {
    console.error("Login error:", err); // debugging
    res.status(500).send("Login failed.");
  }
});

router.post("/logout", (req, res) => {
  // destroy the session on the server
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).send("Logout failed");
    }
    // clear the cookie (default name is 'connect.sid')
    res.clearCookie("connect.sid", { path: "/" });
    return res.sendStatus(200);
  });
});

router.get("/me", isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

module.exports = router;
