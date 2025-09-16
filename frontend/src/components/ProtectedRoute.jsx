import React from "react";
import { Navigate } from "react-router-dom";

// roles: array of allowed roles for this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    // Not logged in
    return <Navigate to="/auth" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT
    const userRole = payload.userType; // assuming your JWT has `userType` like 'alumni' or 'institute'

    if (!allowedRoles.includes(userRole)) {
      // Logged in but wrong role
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (err) {
    // Invalid token
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
