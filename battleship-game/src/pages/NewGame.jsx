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
    handleHit
  } = useContext(GameContext);

  console.log("handleHit", handleHit);

  const { gameId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Not logged in ⇒ send to login
    if (currentUser === null) {
      navigate("/login");
      return;
    }

    // 2) No gameId and no game yet ⇒ create a new game
    if (!gameId && !game) {
      createGame().then((newGame) => {
        // push the new ID into the URL without adding history entries
        navigate(`/game/${newGame._id}`, { replace: true });
      });
      return;
    }

    // 3) gameId present and still no game ⇒ join that game
    if (gameId && !game) {
      joinGame(gameId).catch(() => {});
    }
  }, [currentUser, gameId, game, navigate, createGame, joinGame]);

  // —————————————————————————————————————————————————————
  // Render states

  if (currentUser === null) {
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

  // Both players are now in:
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
          <GameBoard 
            board={oppBoard} 
            hideShips className="board-opponent" 
            isPlayer={false}
            onCellClick={handleHit}
          />
        )}
        {myBoard && (
          <GameBoard
            board={myBoard}
            hideShips={false}
            className="board-player"
            isPlayer={true}
          />
        )}
      </div>
      <Link to="/" className="btn-return">
        Back to Home
      </Link>
    </div>
  );
}
