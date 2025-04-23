const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/games/rank
// returns [{ username, wins, losses }, …] sorted
router.get("/rank", async (req, res) => {
  try {
    const users = await User.find({}, "username wins losses")
      .sort({ wins: -1, losses: 1, username: 1 })
      .lean();

    res.json(users);
  } catch (err) {
    console.error("Error fetching rank:", err);
    res.status(500).send("Could not load rank");
  }
});

// PATCH /api/games/:userId/win
router.patch("/:userId/win", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("User not found");
  await user.recordWin();
  res.json({ wins: user.wins, losses: user.losses });
});

// PATCH /api/games/:userId/loss
router.patch("/:userId/loss", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("User not found");
  await user.recordLoss();
  res.json({ wins: user.wins, losses: user.losses });
});

module.exports = router;
