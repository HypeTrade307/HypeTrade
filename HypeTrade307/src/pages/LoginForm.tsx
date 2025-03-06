// LoginForm.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface User {
  email: string;
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [signUp, setSignUp] = useState<boolean>(false);
  const navigate = useNavigate();

  const [loginUser, setLoginUser] = useState<Omit<User, "username">>({
    email: "",
    password: "",
  });

  const [newUser, setNewUser] = useState<User>({
    email: "",
    username: "",
    password: "",
  });

  // Handle changes for login fields
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginUser({ ...loginUser, [e.target.name]: e.target.value });
  };

  // Handle changes for signup fields
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Submit login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", loginUser);
      localStorage.setItem("token", response.data.access_token);
      toast.success("Login successful!");
      navigate("/Portfolios");
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials");
    }
  };

  // Submit signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
      }
      toast.success("Account created successfully!");
      setSignUp(false);
    } catch (error) {
      console.error(error);
      toast.error("Error signing up. Maybe the email is taken.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          borderRadius: "8px",
        }}
      >
        {!signUp ? (
          // --- LOGIN FORM ---
          <form onSubmit={handleLogin}>
            <h2 style={{ marginBottom: "5px" }}>Welcome to</h2>
            <h1 style={{ marginTop: "0", marginBottom: "20px" }}>HypeTrade</h1>

            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={loginUser.email}
                onChange={handleLoginChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={loginUser.password}
                onChange={handleLoginChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Login
            </button>

            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={() => setSignUp(true)}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  padding: "8px 16px",
                  color: "#fff",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          // --- SIGNUP FORM ---
          <form onSubmit={handleSignup}>
            <button
              onClick={() => setSignUp(false)}
              type="button"
              style={{
                float: "right",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              x
            </button>
            <h1 style={{ marginBottom: "20px" }}>Sign Up</h1>

            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={newUser.email}
                onChange={handleSignupChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                value={newUser.username}
                onChange={handleSignupChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={newUser.password}
                onChange={handleSignupChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
