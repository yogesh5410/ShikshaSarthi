import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // adjust if needed

const Authorization: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "1234" && password === "1234") {
      navigate("/uploadquestion");
    } else {
      setError("Invalid credentials. Please enter correct credentials for both.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "30px",
        borderRadius: "10px",
        backgroundColor: "#f9fafb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Admin Login</h2>

      <label style={{ fontWeight: 600 }}>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <label style={{ fontWeight: 600 }}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {error && (
        <div style={{ color: "red", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <Button size="sm" onClick={handleLogin} style={{ width: "100%" }}>
        Login
      </Button>
    </div>
  );
};

export default Authorization;
