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

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data); 
        navigate("/"); 
      } else {
        const err = await res.text();
        setErrorMsg(err || "Login failed.");
      }
    } catch (err) {
      setErrorMsg("Server error.");
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
