import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; 
import './Navbar.css';
import logo from "../Assests/Photos/Logo.jpeg";
import { FaSearch, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); 
  };

  const handleDashboardClick = () => {
    navigate('/'); 
  };
  const handleProfileClick = () => {
    navigate('/profile'); 
  };

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
        {user ? (
          <>
            <button className="navbar-btn" onClick={handleDashboardClick}>Dashboard</button> 
            <button className="navbar-btn" >Chat</button> 
            <button className="navbar-btn" onClick={handleProfileClick}>Profile</button>
            <button className="navbar-btn logout-btn" onClick={handleLogout}> 
              <FaSignOutAlt size={25} />
            </button>
          </>
        ) : <></>}
      </div>
    </nav>
  );
};

export default Navbar;