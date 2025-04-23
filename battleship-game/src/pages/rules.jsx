import React from "react";
import { Link } from "react-router-dom";
import "./rules.css";


function RulesPage() {
  return (
    <div className="rules-container">
      <header className="navbar">
        <h1>Battleship Game</h1>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/game/normal">Play Game</Link></li>
            <li><Link to="/scores">High Scores</Link></li>
          </ul>
        </nav>
      </header>

      <main className="rules-content">
        <h2>Game Rules</h2>
        <ol className="rules-list">
          <li>Players take turns to fire shots at each other's grid.</li>
          <li>Hits are marked with a green check mark and misses with a red X.</li>
          <li>Each player must strategically position their ships before the game starts.</li>
          <li>The player who sinks all of the opponent's ships first wins.</li>
          <li>Game time is tracked using a timer displayed on the game screen.</li>
        </ol>

        <section className="video-section">
          <h2>Learn How to Play</h2>
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/VIDEO_ID" 
            title="YouTube video player" 
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </section>

        <Link to="/" className="btn-return">Back to Home</Link>
      </main>
    </div>
  );
}

export default RulesPage;
