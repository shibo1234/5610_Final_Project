import React, { useContext } from "react";
import "./board.css";
import { GameContext } from "../game_context";

function GameBoard({ isPlayer, board, onAttack, resetGame }) {

    const { gameStarted, playerTurn } = useContext(GameContext); 

    const handleClick = (row, col) => {
        if (!isPlayer && playerTurn && gameStarted && board[row][col] !== "X" && board[row][col] !== "H") {
            onAttack(row, col);
        }
    };

    return (
        <div className="board">
        {board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
                <div
                    key={colIndex}
                    className={`cell 
                        ${cell === "X" ? "miss" : ""} 
                        ${cell === "H" ? "hit" : ""} 
                        ${(isPlayer && cell === "S" && (isPlayer || gameStarted)) ? "ship" : ""}
                        ${!isPlayer ? "hover-effect" : ""}
                    `}
                    onClick={() => handleClick(rowIndex, colIndex)}
                >
                    {cell === "X" ? "X" : cell === "H" ? "H" : isPlayer && cell === "S" ? "S" : ""}
                </div>
            ))}
            </div>
        ))}

        {
            resetGame && (
                <button className="reset-button" onClick={resetGame}>Reset Game</button>
            )
        }
        </div>
    );
}

export default GameBoard;
