import { Link } from "react-router-dom";
import "./App.css";
import { FaGamepad, FaBook, FaTrophy } from "react-icons/fa";
import Navbar from "./components/Navbar";
import myImage from "./images/NPIXTXSIUNHV3ACRPMPSP6TKGM.png.avif";

function App() {
  return (
    <div className="container">
      <Navbar />
      <h1 className="title">🚢 Battleship Game</h1>
      <p className="subtitle">Choose a game mode:</p>
      <div className="button-container">
        <Link to="/game/normal">
          <button className="game-button">
            <FaGamepad /> Normal Mode
          </button>
        </Link>
        <Link to="/game/easy">
          <button className="game-button">
            <FaGamepad /> Free Play Mode
          </button>
        </Link>
        <Link to="/rules">
          <button className="rules-button">
            <FaBook /> Rules
          </button>
        </Link>
        <Link to="/high-scores">
          <button className="scores-button">
            <FaTrophy /> High Scores
          </button>
        </Link>

        <img src={myImage}></img>
      </div>
    </div>
  );
}

export default App;
