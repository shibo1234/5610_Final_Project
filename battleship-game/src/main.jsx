import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import NormalGame from "./game/normal_game.jsx";
import EasyGame from "./game/easy_game.jsx";
import Rules from "./pages/rules.jsx";
import { GameProvider } from "./game_context";
import HighScoresPage from "./pages/scores.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NewGame from "./pages/NewGame.jsx";
import AllGames from "./pages/AllGames.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game/normal" element={<NormalGame />} />
          <Route path="/game/easy" element={<EasyGame />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/high-scores" element={<HighScoresPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/game" element={<NewGame />} />
          <Route path="/game/:gameId" element={<NewGame />} />
          <Route path="/games" element={<AllGames />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  </StrictMode>
);
