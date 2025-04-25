import React, { createContext, useState, useEffect } from "react";

const GameContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE || "";

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

  // ── Multiplayer state ──────────────────────────────
  const [game, setGame] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [myBoard, setMyBoard] = useState(null);
  const [oppBoard, setOppBoard] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/me`, {
      credentials: "include",
    })
      .then((res) => {
        console.log("Response from /api/me:", res.status);
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((user) => {
        console.log("User restored from session:", user);
        setCurrentUser(user);
      })
      .catch((err) => {
        console.warn("No session found:", err);
        setCurrentUser(null);
      });
  }, []);

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

  useEffect(() => {
    if (!gameOver || !currentUser) return;

    const didWin = aiShipsDestroyed === SHIPS_SIZES.length;
    const endpoint = didWin ? "win" : "loss";

    fetch(`${API_BASE}/api/games/${currentUser.id}/${endpoint}`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(({ wins, losses }) => {
        setCurrentUser((u) => ({ ...u, wins, losses }));
      })
      .catch((err) => console.error("Failed to record game:", err));
  }, [gameOver]);

  useEffect(() => {
    if (!game || game.status !== "Open") return;
  
    const interval = setInterval(() => {
      fetch(`${API_BASE}/api/games/${game._id}`, {
        credentials: "include",
      })
        .then(res => res.json())
        .then(updated => {
          if (updated.status === "Active") {
            setGame(updated);
            const youAreP1 = updated.player1.id === currentUser.id;
            setMyBoard(youAreP1 ? updated.board1 : updated.board2);
            setOppBoard(youAreP1 ? updated.board2 : updated.board1);
            setWaiting(false); 
          }
        })
        .catch(err => {
          console.error("Polling error:", err);
        });
    }, 2000); 
  
    return () => clearInterval(interval);
  }, [game, currentUser]);
  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };
  

  // ── Multiplayer helpers ─────────────────────────────
  // ── createGame ────────────────────────────────────
  const createGame = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/games/new`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newGame = await res.json();
      setGame(newGame);
      setWaiting(true);

      // server gave us board1
      setMyBoard(newGame.board1);
      setOppBoard(null);

      // HashRouter share-link
      setShareLink(`${window.location.origin}/#/game/${newGame._id}`);
      return newGame;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ── joinGame ──────────────────────────────────────
  const joinGame = async (gameId) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/games/${gameId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      const joined = await res.json();
      setGame(joined);
      setWaiting(false);

      // server gave us both boards
      const youAreP1 = joined.player1.id === currentUser.id;
      setMyBoard(youAreP1 ? joined.board1 : joined.board2);
      setOppBoard(youAreP1 ? joined.board2 : joined.board1);

      return joined;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

    const formattedTime = formatTime(elapsedTime);

    const login = (user) => {
        setCurrentUser(user);
    };

    const logout = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/logout`, {
            method: "POST",
            credentials: "include",
            });
            if (!res.ok) {
            console.error("Logout failed:", res.status);
            return;
            }
            // only clear React state once the cookie is gone
            setCurrentUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    const handleHit = async (row, col) => {
        if (!game || !currentUser) return;
    
        try {
            const res = await fetch(`${API_BASE}/api/games/${game._id}/attack`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ row, col })
        });
    
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to hit.");
        }
    
        const updatedGame = await res.json();
        setGame(updatedGame);
    
        const youAreP1 = updatedGame.player1.id === currentUser.id;
        setMyBoard(youAreP1 ? updatedGame.board1 : updatedGame.board2);
        setOppBoard(youAreP1 ? updatedGame.board2 : updatedGame.board1);
        } catch (err) {
            if (err.message === "Not your turn") {
                alert("⏳ It's not your turn!");
                return;
              }
            console.error("handleHit error:", err);
            setError(err.message);
        }
    };
  

  return (
    <GameContext.Provider
      value={{
        currentUser,
        login,
        logout,
        game,
        waiting,
        myBoard,
        oppBoard,
        shareLink,
        error,
        createGame,
        joinGame,
        handleHit
      }}
    >
      {children}
    </GameContext.Provider>
  );
};



export { GameContext, GameProvider };
