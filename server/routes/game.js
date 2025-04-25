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

module.exports = router;
