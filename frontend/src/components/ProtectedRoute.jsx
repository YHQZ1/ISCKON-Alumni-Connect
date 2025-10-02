import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    validateToken();
  }, [allowedRoles]); // Added allowedRoles to dependencies

  const validateToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      
      if (!token) {
        console.log("No token found");
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("User role from token:", payload.userType);
      console.log("Allowed roles:", allowedRoles);

      const userRole = payload.userType;

      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        console.log("Token expired");
        localStorage.removeItem("jwtToken");
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      // Check role authorization - make sure this matches exactly
      if (!allowedRoles.includes(userRole)) {
        console.log(`Role '${userRole}' not in allowed roles:`, allowedRoles);
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      console.log("Authorization successful!");
      setIsAuthorized(true);
      setIsValidating(false);
      
    } catch (err) {
      console.error("Token validation error:", err);
      localStorage.removeItem("jwtToken");
      setIsAuthorized(false);
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
      return <Navigate to="/auth" replace />;
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;