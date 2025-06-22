// src/pages/Signup.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/api";
import "../styles/Signup.css";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phonenum, setPhonenum] = useState("");
  const [gender, setGender] = useState("");
  const [usertype, setUsertype] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await signupUser({
        fullname,
        email,
        password,
        phonenum,
        gender,
        usertype,
      });
      if (data.message) {
        alert("Signup successful! Please log in.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert(
        error.response?.data?.error || "Signup failed. Please check your input."
      );
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Enlarged, stylish heading */}
        <h1 className="auth-heading">CineMAK</h1>
        <h2 className="form-subheading">Signup</h2>
        <form onSubmit={handleSignup} className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phonenum}
            onChange={(e) => setPhonenum(e.target.value)}
            required
            className="input-field"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={usertype}
            onChange={(e) => setUsertype(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select User Type</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
          <button type="submit" className="btn primary-btn">
            Sign Up
          </button>
        </form>
        <p className="form-footer">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
