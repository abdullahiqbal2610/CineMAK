// src/pages/Login.js

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      if (data && data.userType) {
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("userType", data.userType);
        setAuth({ token: data.token, userType: data.userType });
        if (data.userType === "admin") {
          navigate("/admin-dashboard");
        } else if (data.userType === "customer") {
          navigate("/customer-dashboard");
        }
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        error.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Enlarged, stylish heading */}
        <h1 className="auth-heading">CineMAK</h1>
        <h2 className="form-subheading">Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <button type="submit" className="btn primary-btn">
            Login
          </button>
        </form>
        <p className="form-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="link">
            Signup here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
