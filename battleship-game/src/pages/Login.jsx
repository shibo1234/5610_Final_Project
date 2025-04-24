import React, { useState, useContext, useEffect } from "react";
import { GameContext } from "../game_context";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { currentUser, login } = useContext(GameContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const user = await res.json();
        login(user);
        navigate("/");
      } else {
        const text = await res.text();
        setErrorMsg(text || "Invalid credentials.");
      }
    } catch (err) {
      setErrorMsg("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Log In</button>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  );
}
