import React, { createContext, useState, useEffect } from "react";

const GameContext = createContext();

const GameProvider = ({ children }) => {
  const GRID_SIZE = 10;
  const SHIPS_SIZES = [5, 4, 3, 3, 2];
  const emptyBoard = () =>
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

  const [playerBoard, setPlayerBoard] = useState(emptyBoard());
  const [aiBoard, setAIBoard] = useState(emptyBoard());
  const [playerShips, setPlayerShips] = useState([]);
  const [aiShips, setAIShips] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [playerShipsDestroyed, setPlayerShipsDestroyed] = useState(0);
  const [aiShipsDestroyed, setAiShipsDestroyed] = useState(0);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedGame = localStorage.getItem("battleshipGameState");
    if (savedGame) {
      const state = JSON.parse(savedGame);
      setPlayerBoard(state.playerBoard);
      setAIBoard(state.aiBoard);
      setPlayerShips(state.playerShips);
      setAIShips(state.aiShips);
      setPlayerTurn(state.playerTurn);
      setGameStarted(state.gameStarted);
      setElapsedTime(state.elapsedTime);
      setPlayerShipsDestroyed(state.playerShipsDestroyed);
      setAiShipsDestroyed(state.aiShipsDestroyed);
    }
  }, []);

  useEffect(() => {
    if (gameStarted) {
      localStorage.setItem(
        "battleshipGameState",
        JSON.stringify({
          playerBoard,
          aiBoard,
          playerShips,
          aiShips,
          playerTurn,
          gameStarted,
          elapsedTime,
          playerShipsDestroyed,
          aiShipsDestroyed,
        })
      );
    }
  }, [
    playerBoard,
    aiBoard,
    playerShips,
    aiShips,
    playerTurn,
    gameStarted,
    elapsedTime,
    playerShipsDestroyed,
    aiShipsDestroyed,
  ]);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      setTimerRunning(true);
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setTimerRunning(false);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setPlayerTurn(true);
    placeShips();
    setElapsedTime(0);
    setPlayerShipsDestroyed(0);
    setAiShipsDestroyed(0);
  };

  const resetGame = () => {
    localStorage.removeItem("battleshipGameState");
    setGameOver(false);
    setGameStarted(false);
    setPlayerBoard(emptyBoard());
    setAIBoard(emptyBoard());
    setPlayerShips([]);
    setAIShips([]);
    setElapsedTime(0);
    setPlayerShipsDestroyed(0);
    setAiShipsDestroyed(0);
  };

  if (gameOver) {
    const playerScore = elapsedTime > 0 ? 100000 / elapsedTime : 0;
    updateHighScores("Player", Math.floor(playerScore));
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const placeShips = () => {
    const placeShipsOnBoard = (board) => {
      let ships = [];

      for (let size of SHIPS_SIZES) {
        let placed = false;
        while (!placed) {
          let row = Math.floor(Math.random() * GRID_SIZE);
          let col = Math.floor(Math.random() * GRID_SIZE);
          let direction = Math.random() > 0.5 ? "H" : "V";

          if (canPlaceShip(board, row, col, size, direction)) {
            board = applyShipToBoard(board, row, col, size, direction);
            ships.push({ row, col, size, direction, hits: 0 });
            placed = true;
          }
        }
      }

      return { board, ships };
    };

    let playerBoard = emptyBoard();
    let aiBoard = emptyBoard();

    const playerPlacement = placeShipsOnBoard(playerBoard);
    const aiPlacement = placeShipsOnBoard(aiBoard);

    setPlayerBoard(playerPlacement.board);
    setAIBoard(aiPlacement.board);
    setPlayerShips(playerPlacement.ships);
    setAIShips(aiPlacement.ships);
  };

  const canPlaceShip = (board, row, col, size, direction) => {
    if (direction === "H") {
      if (col + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) {
        if (board[row][col + i] !== null) return false;
      }
    } else {
      if (row + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) {
        if (board[row + i][col] !== null) return false;
      }
    }
    return true;
  };

  const applyShipToBoard = (board, row, col, size, direction) => {
    let newBoard = board.map((row) => [...row]);

    for (let i = 0; i < size; i++) {
      if (direction === "H") {
        newBoard[row][col + i] = "S";
      } else {
        newBoard[row + i][col] = "S";
      }
    }
    return newBoard;
  };

  const handleAttack = (row, col, isEasyMode = false) => {
    if (!playerTurn) {
      // console.log("Blocked: Not player's turn");
      return;
    }
    const newAIBoard = aiBoard.map((row) => [...row]);
    newAIBoard[row][col] = aiBoard[row][col] === "S" ? "H" : "X";
    setAIBoard(newAIBoard);

    let hitShip = aiShips.find((ship) => {
      return (
        (ship.direction === "H" &&
          ship.row === row &&
          ship.col <= col &&
          col < ship.col + ship.size) ||
        (ship.direction === "V" &&
          ship.col === col &&
          ship.row <= row &&
          row < ship.row + ship.size)
      );
    });

    if (hitShip) {
      hitShip.hits += 1;
    }

    const isShipDestroyed = hitShip && hitShip.hits >= hitShip.size;

    if (isShipDestroyed) {
      console.log("🚢 AI Ship Destroyed!");
      setAiShipsDestroyed((prev) => prev + 1);
    }

    setAIShips([...aiShips]);

    if (aiShips.every((ship) => ship.hits >= ship.size)) {
      setGameOver(true);
    }

    if (!isEasyMode) {
      setPlayerTurn(false);
      setTimeout(aiAttack, 500);
    }
    // setTimeout(aiAttack, 500);
  };

  const aiAttack = () => {
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (playerBoard[row][col] === "X" || playerBoard[row][col] === "H");

    const newPlayerBoard = playerBoard.map((row) => [...row]);
    newPlayerBoard[row][col] = "X";
    setPlayerBoard(newPlayerBoard);

    let hitShip = playerShips.find((ship) => {
      return (
        (ship.direction === "H" &&
          ship.row === row &&
          ship.col <= col &&
          col < ship.col + ship.size) ||
        (ship.direction === "V" &&
          ship.col === col &&
          ship.row <= row &&
          row < ship.row + ship.size)
      );
    });

    if (hitShip) {
      hitShip = { ...hitShip, hits: hitShip.hits + 1 };
      newPlayerBoard[row][col] = "H";
    } else {
      newPlayerBoard[row][col] = "X";
    }

    setPlayerBoard(newPlayerBoard);

    const isShipDestroyed = hitShip && hitShip.hits >= hitShip.size;
    if (isShipDestroyed) {
      console.log("🚢 Player Ship Destroyed!");
      setPlayerShipsDestroyed((prev) => prev + 1);
    }

    const updatedPlayerShips = playerShips.map((ship) =>
      ship === hitShip ? { ...ship, hits: ship.hits + 1 } : ship
    );

    setPlayerShips(updatedPlayerShips);

    if (hitShip) {
      setPlayerShips(updatedPlayerShips);
    }

    if (updatedPlayerShips.every((ship) => ship.hits >= ship.size)) {
      setGameOver(true);
      return;
    }

    setPlayerTurn(true);
  };

  const formattedTime = formatTime(elapsedTime);

  const login = (user) => {
    setCurrentUser(user);
  };

  const logout = async () => {
    setCurrentUser(null);
    await fetch("http://localhost:3001/api/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  return (
    <GameContext.Provider
      value={{
        playerBoard,
        setPlayerBoard,
        aiBoard,
        setAIBoard,
        playerShips,
        setPlayerShips,
        aiShips,
        setAIShips,
        gameOver,
        setGameOver,
        gameStarted,
        setGameStarted,
        playerTurn,
        setPlayerTurn,
        elapsedTime,
        setElapsedTime,
        timerRunning,
        setTimerRunning,

        playerShipsDestroyed,
        setPlayerShipsDestroyed,
        aiShipsDestroyed,
        setAiShipsDestroyed,

        startGame,
        resetGame,
        formattedTime,
        handleAttack,
        GRID_SIZE,
        SHIPS_SIZES,
        emptyBoard,

        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameProvider };
