import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../game_context";
import { Link, useNavigate } from "react-router-dom";
import "../game/game.css";

export default function AllGames() {
  const { currentUser } = useContext(GameContext);
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/games", { credentials: "include" })
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games:", err));
  }, []);

  if (!games.length) return <p>Loading games…</p>;

  const now = new Date();

  const isUserInGame = (game) =>
    game.player1?.id === currentUser?.id ||
    game.player2?.id === currentUser?.id;

  const categorized = {
    openGames: [],
    myOpenGames: [],
    myActiveGames: [],
    myCompletedGames: [],
    otherGames: [],
    guestActive: [],
    guestCompleted: [],
  };

  for (const game of games) {
    const isCurrentUserP1 = currentUser?.id === game.player1?.id;
    const isCurrentUserP2 = currentUser?.id === game.player2?.id;
    const isCurrentUser = isCurrentUserP1 || isCurrentUserP2;

    const isOpen = game.status === "Open";
    const isActive = game.status === "Active";
    const isCompleted = game.status === "Completed";

    if (currentUser) {
      if (isOpen && !isCurrentUser) categorized.openGames.push(game);
      else if (isOpen && isCurrentUser) categorized.myOpenGames.push(game);
      else if (isActive && isCurrentUser) categorized.myActiveGames.push(game);
      else if (isCompleted && isCurrentUser)
        categorized.myCompletedGames.push(game);
      else categorized.otherGames.push(game);
    } else {
      if (isActive) categorized.guestActive.push(game);
      if (isCompleted) categorized.guestCompleted.push(game);
    }
  }

  const formatDate = (ts) =>
    ts ? new Date(ts).toLocaleString() : "Unknown time";

  const GameLink = ({ game }) => (
    <Link to={`/game/${game._id}`}>
      Game #{game._id.slice(-5)} ({formatDate(game.createdAt)})
    </Link>
  );

  const Section = ({ title, list, render }) =>
    list.length > 0 && (
      <section>
        <h3>{title}</h3>
        <ul>
          {list.map((g) => (
            <li key={g._id}>{render(g)}</li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="allgames-container">
      <h2>All Games</h2>

      {currentUser ? (
        <>
          <Section
            title="Open Games"
            list={categorized.openGames}
            render={(g) => (
              <>
                <GameLink game={g} />{" "}
                <button onClick={() => navigate(`/game/${g._id}`)}>Join</button>
              </>
            )}
          />
          <Section
            title="My Open Games"
            list={categorized.myOpenGames}
            render={(g) => <GameLink game={g} />}
          />
          <Section
            title="My Active Games"
            list={categorized.myActiveGames}
            render={(g) => (
              <>
                <GameLink game={g} /> vs{" "}
                {g.player1.id === currentUser.id
                  ? g.player2?.username
                  : g.player1.username}
              </>
            )}
          />
          <Section
            title="My Completed Games"
            list={categorized.myCompletedGames}
            render={(g) => (
              <>
                <GameLink game={g} /> vs{" "}
                {g.player1.id === currentUser.id
                  ? g.player2?.username
                  : g.player1.username}{" "}
                → {g.winner === currentUser.username ? "✅ Won" : "❌ Lost"}
              </>
            )}
          />
          <Section
            title="Other Players' Games"
            list={categorized.otherGames}
            render={(g) => (
              <>
                <GameLink game={g} /> — {g.player1.username} vs{" "}
                {g.player2?.username || "…"} ({g.status})
              </>
            )}
          />
        </>
      ) : (
        <>
          <Section
            title="Active Games"
            list={categorized.guestActive}
            render={(g) => (
              <>
                {g.player1.username} vs {g.player2.username} @{" "}
                {formatDate(g.createdAt)}
              </>
            )}
          />
          <Section
            title="Completed Games"
            list={categorized.guestCompleted}
            render={(g) => (
              <>
                {g.player1.username} vs {g.player2.username} — Winner:{" "}
                {g.winner} ({formatDate(g.createdAt)} →{" "}
                {formatDate(g.updatedAt)})
              </>
            )}
          />
        </>
      )}
    </div>
  );
}
