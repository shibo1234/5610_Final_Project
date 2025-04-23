import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { GameContext } from "../game_context";
import "./scores.css";

function HighScoresPage() {
  const [scores, setScores] = useState([]);
  const { currentUser } = useContext(GameContext);

  useEffect(() => {
    async function loadScores() {
      try {
        const res = await fetch("http://localhost:3001/api/gamesRank/rank", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch scores");
        const data = await res.json();
        data.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          if (a.losses !== b.losses) return a.losses - b.losses;
          return a.username.localeCompare(b.username);
        });
        setScores(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadScores();
  }, []);

  return (
    <div className="scores-container">
      <header className="navbar">
        <h1>High Scores</h1>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/game/normal">Play Game</Link>
            </li>
            <li>
              <Link to="/rules">Rules</Link>
            </li>
            <li>
              <Link to="/scores" className="active">
                High Scores
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="scores-content">
        <h2>Top Players</h2>
        <table className="scores-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((player, idx) => {
              const isCurrent =
                currentUser && player.username === currentUser.username;
              return (
                <tr
                  key={player.username}
                  className={isCurrent ? "highlight" : ""}
                >
                  <td>{idx + 1}</td>
                  <td>
                    {isCurrent ? (
                      <strong>{player.username}</strong>
                    ) : (
                      player.username
                    )}
                  </td>
                  <td>{player.wins}</td>
                  <td>{player.losses}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Link to="/" className="btn-return">
          Back to Home
        </Link>
      </main>
    </div>
  );
}

export default HighScoresPage;
