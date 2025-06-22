// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If a specific role is required but doesn't match, redirect to login (or another page)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected content
  return children;
};

export default ProtectedRoute;
