const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
