import React, {useContext } from "react";
import { Link } from "react-router-dom";
import GameBoard from "../components/game_board.jsx";
import "./game.css";

import { GameContext } from "../game_context";

function NormalGame() {
    const {
        playerBoard, 
        aiBoard, 
        playerShips, 
        gameOver, 
        gameStarted, 
        playerTurn, 
        playerShipsDestroyed, 
        aiShipsDestroyed, 
        startGame,
        resetGame,
        formattedTime,
        handleAttack,
    } = useContext(GameContext); 

    return (
        <div className="game-container">
            <div className="game-title">
                <h1>Normal Mode</h1>
                <p>Play against AI</p>
            </div>

            <div className="scoreboard">
                <p>🚢 Player Ships Destroyed: {playerShipsDestroyed}</p>
                <p>💥 AI Ships Destroyed: {aiShipsDestroyed}</p>
                <p className="Timer">⏳ Time: {formattedTime}</p>
            </div>

            {!gameStarted && <button className="start-button" onClick={startGame}>Start Game</button>}
            {gameOver && <h2 className="game-over-message">Game Over! {playerShips.every(ship => ship.hits >= ship.size) ? "AI Wins!" : "Player Wins!"}</h2>}

            
            <div className="game-boards">
                <div className="board-wrapper">
                    <h2>Player Board</h2>
                    <GameBoard isPlayer={true} board={playerBoard} gameStarted={gameStarted} />
                </div>

                <div className="board-wrapper">
                    <h2>AI Board</h2>
                    <GameBoard isPlayer={false} board={aiBoard} gameStarted={gameStarted} onAttack={handleAttack} playerTurn={playerTurn} />

                </div>
            </div>

            <div className="buttons-container">
                <button className="reset-button" onClick={resetGame} disabled={!gameStarted}>Reset Game</button>
                <Link to="/">
                    <button className="back-button">Back to Home</button>
                </Link>
            </div>
        </div>
    );
}

export default NormalGame;



