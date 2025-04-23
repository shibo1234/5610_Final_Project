// src/pages/NewGame.jsx
import React, { useContext, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GameContext } from "../game_context";
import GameBoard from "../components/game_board.jsx";
import "../game/game.css";

export default function NewGame() {
  const {
    currentUser,
    game,
    myBoard,
    oppBoard,
    waiting,
    shareLink,
    error,
    createGame,
    joinGame,
  } = useContext(GameContext);

  const { gameId } = useParams();
  const navigate = useNavigate();

  // create or join on mount
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (gameId) {
      joinGame(gameId);
    } else {
      createGame();
    }
  }, [currentUser, gameId]);

  if (!currentUser) {
    return (
      <div className="newgame-container no-interaction">
        <p>
          Please <Link to="/login">log in</Link> to create or join games.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="newgame-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="newgame-container">
        <p>Initializing game…</p>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="newgame-container">
        <h2>Game Created</h2>
        <p>Share this link to let another player join:</p>
        <input className="share-link" readOnly value={shareLink} />
        <h3>Waiting for opponent to join…</h3>
        {myBoard && <GameBoard board={myBoard} hideShips={false} />}
      </div>
    );
  }

  // both players are in
  const opponent =
    game.player1.id === currentUser.id ? game.player2 : game.player1;

  return (
    <div className="newgame-container">
      <h2>
        {game.status === "Completed"
          ? `${game.winner} Wins!`
          : `Playing vs ${opponent.username}`}
      </h2>
      <div className="game-boards">
        {oppBoard && (
          <GameBoard board={oppBoard} hideShips className="board-opponent" />
        )}
        {myBoard && (
          <GameBoard
            board={myBoard}
            hideShips={false}
            className="board-player"
          />
        )}
      </div>
      <Link to="/" className="btn-return">
        Back to Home
      </Link>
    </div>
  );
}
