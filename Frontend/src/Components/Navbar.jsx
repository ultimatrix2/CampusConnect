import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; 
import './Navbar.css';
import logo from "../Assests/Photos/Logo.jpeg";
import { FaSearch, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({search, setSearch}) => {
  console.log(setSearch)
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

  const handleChat = () => {
    navigate('/chat');
  }

  const handleInputChange = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue); 
  }

  useEffect(() => {
    if (search) {
      navigate("/");
    }
  }, [search]);

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
          onChange={handleInputChange}
        />
        <button className="search-btn">
          <FaSearch size={20} />
        </button>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <button className="navbar-btn" onClick={handleDashboardClick}>Dashboard</button> 
            <button className="navbar-btn" onClick={handleChat}>Chat</button> 
            <button className="navbar-btn">Profile</button>
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
