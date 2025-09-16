import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AlumniHomePage from "./Alumni/AlumniHomePage";
import InstituteHomePage from "./Institute/InstituteHomePage";
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/signup/:userType" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/alumni/home" element={<AlumniHomePage />} />
          <Route path="/institute/home" element={<InstituteHomePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;