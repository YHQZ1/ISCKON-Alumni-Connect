import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AlumniHomePage from "./Alumni/AlumniHomePage";
import InstituteHomePage from "./Institute/InstituteHomePage";
import AlumniProfile from "./Alumni/AlumniProfile";
import InstituteProfile from "./Institute/InstituteProfile";
import InstituteDetails from "./Alumni/InstituteDetails";
import VoiceNugget from "./components/VoiceNugget";

import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Component to determine user type based on route
function VoiceNuggetWrapper() {
  const location = useLocation();
  
  const getCurrentUserType = () => {
    if (location.pathname.startsWith('/alumni')) return 'alumni';
    if (location.pathname.startsWith('/institute')) return 'institution';
    return 'guest'; // for landing page, auth, etc.
  };

  return <VoiceNugget userType={getCurrentUserType()} />;
}

function App() {
  return (
    <Router>
      <div className="App">
        {/* VoiceChat will be available on ALL pages */}
        <VoiceNuggetWrapper />
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/signup/:userType" element={<Auth />} />

          {/* Alumni only */}
          <Route
            path="/alumni/home"
            element={
              <ProtectedRoute allowedRoles={["alumni"]}>
                <AlumniHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/profile"
            element={
              <ProtectedRoute allowedRoles={["alumni"]}>
                <AlumniProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/institute-details/:id"
            element={
              <ProtectedRoute allowedRoles={["alumni"]}>
                <InstituteDetails />
              </ProtectedRoute>
            }
          />

          {/* Institute only */}
          <Route
            path="/institute/home"
            element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstituteHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institute/profile/:id"
            element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstituteProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;