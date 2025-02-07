import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; 
import './Navbar.css';
import logo from "../Assests/Photos/Logo.jpeg";
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'; 

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  
  const [isOpen, setIsOpen] = useState(false); 

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); 
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleChat = () => {
    navigate('/chat');
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Campus Connect Logo" className="logo" />
        <span className="website-name">Campus Connect</span>
      </div>

      
      <button className="menu-btn" onClick={toggleMenu}>
        {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </button>

    
      <div className={`navbar-right ${isOpen ? "open" : ""}`}>
        {user ? (
          <>
            <button className="navbar-btn" onClick={handleDashboardClick}>Dashboard</button> 
            <button className="navbar-btn" onClick={handleChat}>Chat</button> 
            <button className="navbar-btn" onClick={handleProfileClick}>Profile</button>
            <button className="navbar-btn logout-btn" onClick={handleLogout}> 
              <FaSignOutAlt size={25} />
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
