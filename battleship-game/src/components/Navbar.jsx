import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GameContext } from "../game_context";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useContext(GameContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Navbar loaded");
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
    <div className="nav-left">
        <Link to="/">Home</Link>
        <Link to="/games">All Games</Link>
        <Link to="/new-game">New Game</Link>
    </div>

    <div className="nav-right">
        {currentUser ? (
        <div className="user-section">
            <span>{currentUser.username}</span>
            <button onClick={handleLogout}>Sign Out</button>
        </div>
        ) : (
        <div className="auth-buttons">
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
        </div>
        )}
    </div>
    </nav>
  );
};

export default Navbar;
