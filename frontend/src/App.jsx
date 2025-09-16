import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AlumniHomePage from "./Alumni/AlumniHomePage";
import InstituteHomePage from "./Institute/InstituteHomePage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/signup/alumni" element={<Auth />} />
          <Route path="/auth/signup/institution" element={<Auth />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          <Route path="/alumni/home" element={<AlumniHomePage />} />
          <Route path="/institute/home" element={<InstituteHomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;