/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    validateToken();
  }, [allowedRoles]);

  const validateToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      
      if (!token) {
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.userType;

      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem("jwtToken");
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      setIsAuthorized(true);
      setIsValidating(false);
      
    } catch {
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