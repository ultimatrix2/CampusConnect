import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
function Chat() {
  const { selectedChat } = useSelector(state => state.userReducer);
  return (
    <div className="home-page">
      {/* <Header /> */}
      <div className="main-content">
        <Sidebar />
        {/* { selectedChat && <ChatArea /> } */}
      </div>
    </div>
  );
}

export default Chat;