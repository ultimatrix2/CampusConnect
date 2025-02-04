import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";

function App() {
  const user = useSelector((state) => state.user.currentUser);

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
