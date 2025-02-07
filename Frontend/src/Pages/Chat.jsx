import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import './chat.css'
import Navbar from "../Components/Navbar";

function Chat() {
  const  selectedChat  = useSelector(state => state.userReducer);
  console.log("sel",selectedChat)
  return (
    <div className="home-page">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        { selectedChat && <ChatArea /> }
      </div>
    </div>
  );
}

export default Chat;