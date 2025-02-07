import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { createNewMessage, getAllMessages } from "../chatApiCalls/message"
import toast from 'react-hot-toast'
import { useEffect, useState } from "react";
import './chat.css'

function ChatArea() {
    const dispatch = useDispatch();
    const { selectedChat, user } = useSelector(state => state.userReducer);
    const selectedUser = selectedChat.members.find(u => u._id !== user._id);
    const [message, setMessage] = useState('');
    const [allMessage, setAllMessage] = useState([]);

    const sendMessage = async () => {
        try {
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message
            }
            dispatch(showLoader());
            const response = await createNewMessage(newMessage);
            dispatch(hideLoader());

            if(response.success){
                setMessage('');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.Message);
        }
    }

    const getMessage = async () => {
        try {
            dispatch(showLoader());
            const response = await getAllMessages(selectedChat._id);
            dispatch(hideLoader());

            if(response.success){
                setAllMessage(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.Message);
        }
    }

    function formatName(user) {
        let fname = user.name.at(0).toUpperCase() + user.name.slice(1).toLowerCase();
        return fname;
    }

    useEffect(() => {
        getMessage();
    }, [selectedChat])

    return <>
        {!selectedChat && <div class="app-chat-area">
            <div className="app-chat-area-header">
                ( selectedUser.name )
            </div>
            <div className="main-chat-area">
                CHAT AREA
            </div>
            <div className="send-message-div">
                <input type="text" 
                    className="send-message-input" 
                    placeholder="Type a message" 
                    value={message}
                    onChange={(e) => {setMessage(e.target.value)}}
                />
                <button 
                    className="fa fa-paper-plane send-message-btn" 
                    aria-hidden="true">
                    onClick={ sendMessage }
                </button>
            </div>
        </div>}
    </>
}

export default ChatArea;