import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";

import Chat from "./Pages/Chat.jsx";
import OtherProfile from "./Pages/OtherProfile.jsx";
import { loginSuccess } from "./redux/userSlice";
import Profile from "./Pages/Profile.jsx";
import Community from "./Pages/Community.jsx";
import ProfileMatching from "./Pages/ProfileMatching.jsx";
import CodeLab from "./Pages/CodeLab.jsx";

function App() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUser = null;

    try {
      const raw = localStorage.getItem("user");
      storedUser = raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Invalid user in localStorage, resetting:", error);
      localStorage.removeItem("user");
      storedUser = null;
    }

    if (storedUser) {
      dispatch(loginSuccess(storedUser));
    }

    setLoading(false);
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* AUTH */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/home" />}
        />

        {/* MAIN PAGES */}
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />

        {/* PROFILE FLOW */}
        <Route
          path="/profile"
          element={
            user ? (
              <>
                {console.log("✅ /profile route rendered")}
                <Profile />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/community" element={user ? <Community /> : <Navigate to="/" />}  ></Route>
        <Route path="/matching" element={user ? <ProfileMatching /> : <Navigate to="/" />}  ></Route>
        <Route path="/code" element={user ? <CodeLab /> : <Navigate to="/" />} />
        {/* OTHER USER PROFILE */}
        <Route
          path="/u/:id"
          element={user ? <OtherProfile /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
