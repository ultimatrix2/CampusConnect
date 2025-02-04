import React from 'react';
import './Navbar.css'; 
import { FaSearch, FaSignOutAlt } from 'react-icons/fa';
import logo from "../Assests/Photos/Logo.jpeg";
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Campus Connect Logo" className="logo" />
        <span className="website-name">Campus Connect</span>
      </div>
      <div className="navbar-center">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
        />
      <button className="search-btn">
          <FaSearch size={20} />
        </button>
        </div>
      <div className="navbar-right">
        <button className="navbar-btn">Dashboard</button>
        <button className="navbar-btn">Chat</button> 
        <button className="navbar-btn">Profile</button>
        <button className="navbar-btn logout-btn" > <FaSignOutAlt size={25} /></button>
      </div>
    </nav>
  );
};

export default Navbar;
