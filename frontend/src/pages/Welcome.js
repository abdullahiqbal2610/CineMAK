// src/pages/Welcome.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  // Selected vintage theater marquee/neon background image from Unsplash
  const bgImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi8JCcOA4EK4RS3CA3ZQ_2JhIlRmZfU8MH6A&s";




  return (
    <div
      className="welcome-container"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="welcome-overlay">
        <header className="welcome-header">
          <h1 className="welcome-title">CineMAK</h1>
          <p className="welcome-tagline">Experience Cinema. Redefined.</p>
        </header>
        <div className="welcome-buttons">
          <button
            className="btn primary-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="btn secondary-btn"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
