import React, { useState, useContext, useEffect } from "react";
import { GameContext } from "../game_context";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { currentUser, login } = useContext(GameContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return setError(text || "Registration failed.");
      }

      const user = await res.json();
      console.log("User registered:", user);
      login(user); 
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Server error.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <input
        name="confirm"
        type="password"
        placeholder="Confirm Password"
        value={form.confirm}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
