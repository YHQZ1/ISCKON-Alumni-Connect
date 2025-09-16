import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AlumniHomePage from "./Alumni/AlumniHomePage";
import InstituteHomePage from "./Institute/InstituteHomePage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
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

          {/* Institute only */}
          <Route
            path="/institute/home"
            element={
              <ProtectedRoute allowedRoles={["institute"]}>
                <InstituteHomePage />
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
