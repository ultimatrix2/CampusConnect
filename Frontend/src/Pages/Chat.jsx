import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import './chat.css'
import Navbar from "../Components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  console.log(setSearch)
  const  selectedChat  = useSelector(state => state.userReducer);
  console.log("sel",selectedChat)

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    
    if (searchValue) {
      navigate("/");
    }
  }
  return (
    <div className="home-page">
      <Navbar search={search}  setSearch={setSearch} />
      <div className="main-content">
        <Sidebar search={search} />
        { selectedChat && <ChatArea /> }
      </div>
    </div>
  );
}

export default Chat;