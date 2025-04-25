const express = require("express");
const Game = require("../models/Game");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

const GRID_SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2];

// helper to make a random 10×10 board with ships, sepate from the normal game logic
function generateBoard() {
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );
  for (const size of SHIP_SIZES) {
    let placed = false;
    while (!placed) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const dir = Math.random() < 0.5 ? "H" : "V";

      let clash = false;
      for (let i = 0; i < size; i++) {
        const rr = dir === "H" ? r : r + i;
        const cc = dir === "H" ? c + i : c;
        if (rr >= GRID_SIZE || cc >= GRID_SIZE || board[rr][cc] !== null) {
          clash = true;
          break;
        }
      }
      if (clash) continue;

      for (let i = 0; i < size; i++) {
        const rr = dir === "H" ? r : r + i;
        const cc = dir === "H" ? c + i : c;
        board[rr][cc] = "S";
      }
      placed = true;
    }
  }
  return board;
}

// Create a new game: generate Player1's board, leave board2 empty
router.post("/new", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const board1 = generateBoard();

    const newGame = new Game({
      player1: { id: user.id, username: user.username },
      board1,
      board2: [], // until join
      turn: "player1",
      status: "Open",
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (err) {
    console.error("Failed to create game:", err);
    res.status(500).send("Could not create game.");
  }
});

// Join an existing game: generate Player2's board, activate
router.post("/:gameId/join", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = req.session.user;
    const updated = await Game.findByIdAndUpdate(
      gameId,
      {
        player2: { id: user.id, username: user.username },
        board2: generateBoard(),
        status: "Active",
        turn: "player1",
      },
      { new: true }
    );
    console.log("gameId", gameId)
    
    if (!updated) {
      return res.status(404).send("Game not found.");
    }
    res.json(updated);
  } catch (err) {
    console.error("Join game error:", err);
    res.status(500).send("Failed to join game.");
  }
});

router.get("/", async (req, res) => {
  try {
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();
    res.json(games);
  } catch (err) {
    console.error("Error fetching all games:", err);
    res.status(500).send("Could not load games");
  }
});

// user place attack
router.post("/:gameId/attack", isAuthenticated, async (req, res) => {
    try {
        const { row, col } = req.body;
        const { gameId } = req.params;
        const user = req.session.user;

        const game = await Game.findById(gameId);
        if (!game) return res.status(404).send("Game not found.");

        let isPlayer1 = game.player1.username === user.username;
        if ((isPlayer1 && game.turn !== "player1") || (!isPlayer1 && game.turn !== "player2")) {
        return res.status(403).send("Not your turn.");
        }
    
        let boardKey = isPlayer1 ? "board2" : "board1";
        let targetBoard = game[boardKey];

        const cell = targetBoard[row][col];
        if (cell === "H" || cell === "M") {
            return res.status(400).send("Cell already hit.");
        }

        if (cell === "S") {
            targetBoard[row][col] = "H";
        } else {
            targetBoard[row][col] = "M";
        }

        game[boardKey] = targetBoard;
        
    
        // no ship left, game over   
        const isBoardDestroyed = targetBoard.flat().every(cell => cell !== "S");
        if (isBoardDestroyed) {
            game.status = "Completed";
            game.winner = user.username;
        } else {
            game.turn = isPlayer1 ? "player2" : "player1";
        }
  
        await game.save();
        res.status(200).json(game);
    } catch (err) {
      console.error("Hit error:", err);
      res.status(500).send("Failed to place hit.");
    }
});

router.get("/:gameId", isAuthenticated, async (req, res) => {
    try {
      const game = await Game.findById(req.params.gameId);
      if (!game) return res.status(404).send("Game not found.");
      res.json(game);
    } catch (err) {
      console.error("Fetch game failed:", err);
      res.status(500).send("Could not fetch game.");
    }
});
  
  

module.exports = router;
