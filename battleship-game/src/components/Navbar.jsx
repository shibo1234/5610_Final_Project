// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GameContext } from "../game_context";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, logout, createGame } = useContext(GameContext);
  const navigate = useNavigate();

  const handleNewGame = async () => {
    if (!currentUser) {
      return navigate("/login");
    }
    try {
      // createGame returns the new game object, including its _id
      const newGame = await createGame();
      navigate(`/game/${newGame._id}`);
    } catch (err) {
      console.error("Failed to create game:", err);
      // you might also show a flash/toast here
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Home</Link>
        <Link to="/games">All Games</Link>
        <button className="btn-new-game" onClick={handleNewGame}>
          New Game
        </button>
      </div>
      <div className="nav-right">
        {currentUser ? (
          <>
            <span>{currentUser.username}</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
