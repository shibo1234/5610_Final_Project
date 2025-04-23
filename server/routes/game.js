const express = require("express");
const Game = require("../models/Game");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");



router.post("/new", async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).send("Unauthorized");
  
    try {
      const newGame = new Game({
        player1: {
          id: user.id,
          username: user.username
        },
        turn: "player1" 
      });
  
      await newGame.save();
      res.status(201).json(newGame);
    } catch (err) {
      console.error("Failed to create game:", err);
      res.status(500).send("Could not create game.");
    }
  });


router.post("/:gameId/join", isAuthenticated, async (req, res) => {
    try {
        const game = await Game.findById(req.params.gameId);
        if (!game) return res.status(404).send("Game not found.");
        if (game.player2 && game.player2.id) return res.status(400).send("Game already full.");

        const user = req.session.user;

            
        const randomBoard = Array(10).fill(null).map(() => Array(10).fill(null)); 

        game.player2 = {
        id: user.id,
        username: user.username,
        };
        game.board2 = randomBoard;
        game.status = "Active";
        game.turn = "player1";

        await game.save();
        res.status(200).json(game);
    } catch (err) {
      console.error(" Join game error:", err);
      res.status(500).send("Failed to join game.");
    }
});

module.exports = router;
