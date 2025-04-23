import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./scores.css";

function HighScoresPage() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const savedScores = JSON.parse(localStorage.getItem("battleshipHighScores")) || [];
        setScores(savedScores);
    }, []);

    return (
        <div className="scores-container">
            <header className="navbar">
                <h1>High Scores</h1>
                <nav>
                    <ul className="nav-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/game/normal">Play Game</Link></li>
                        <li><Link to="/rules">Rules</Link></li>
                        <li><Link to="/scores" className="active">High Scores</Link></li>
                    </ul>
                </nav>
            </header>

            <main className="scores-content">
                <h2>Top Players</h2>
                <table className="scores-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player Name</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.length > 0 ? (
                            scores.map((score, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{score.name}</td>
                                    <td>{score.score.toLocaleString()}</td>
                                    <td>{score.date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No high scores yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Link to="/" className="btn-return">Back to Home</Link>
            </main>
        </div>
    );
}

export default HighScoresPage;
