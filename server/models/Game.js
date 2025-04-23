const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    player1: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
      },
      player2: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: { type: String },
      },
    board1: { type: Array, default: [] }, 
    board2: { type: Array, default: [] }, 
    turn: { type: String, default: null },
    status: {
        type: String,
        enum: ["Open", "Active", "Completed"],
        default: "Open"
    },
    winner: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", GameSchema);
