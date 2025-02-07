import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";
import { loginSuccess } from "./redux/userSlice";
import Chat from "./Pages/Chat.jsx";
import './Pages/chat.css'
import axios from "axios";

function App() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const { setAllUsers } = useSelector(state => state.user);

useEffect(() => {
  const getAllUsers = async () => {
      try{
        const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5001/api/user/get-all-users', {headers: {Authorization: `Bearer ${token}`}});

          setAllUsers(response.data.data);
        
          // return response.data;
      }catch(error){
          return error;
      }
  }
  getAllUsers();
},[])

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      dispatch(loginSuccess(storedUser));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
