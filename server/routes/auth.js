const express = require("express");
const User = require("../models/User");
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
    console.error(" Registration error:", err);
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
    res.status(500).send("Login failed.");
  }
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.sendStatus(204);
});

module.exports = router;
