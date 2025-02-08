import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../chatApiCalls/chat";
import { setAllChats, setSelectedChat } from "../redux/userSlice";
import moment from 'moment';
import './chat.css';

function UsersList({ searchKey }) {
    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const startNewChat = async (searchedUserId) => {
        let response = null;
        try {
            const members=[currentUser._id,searchedUserId]
            response = await createNewChat(members);
            // if (response.success) {
                toast.success(response?.message);
                const newChat = response;
                const updatedChat = [...allChats, newChat];
                dispatch(setAllChats(updatedChat));
                dispatch(setSelectedChat(newChat));
            // }
        } catch (error) {
            toast.error(response.message);
        }
    }

    const openChat = (selectedUserId) => {
        const chat = allChats.find(chat => 
            chat.members.map( m => m._id ).includes(currentUser._id)&&
            chat.members.map( m => m._id ).includes(selectedUserId)
        )

        if(chat) {
            dispatch(setSelectedChat(chat));
        }
    }

    const IsSelectedChat = (user) => {
        if(selectedChat) {
            return selectedChat.members.map( m => m._id ).includes(user._id);
        }
        return false;
    }

    const getLastMessageTimeStamp = (userId) => {
        const chat = allChats.find( chat => chat.members.map( m=>m._id ).includes(userId));

        if(!chat && chat?.lastMessage) {
            return "";
        }
        else {
            return moment(chat?.lastMessage?.createAt).format('hh:mm A  ');
        }
    }

    const getLastMessage = (userId) => {
        const chat = allChats.find( chat => chat.members.map( m=>m._id ).includes(userId));

        if(!chat) {
            return "";
        }
        else {
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return msgPrefix + chat?.lastMessage?.text?.substring(0, 25) + "...";
        }
    }

    function formatName(user) {
        let fname = user.name.at(0).toUpperCase() + user.name.slice(1).toLowerCase();
        return fname;
    }

    console.log(allUsers)

    return (
        allUsers
            ?.filter(user => {
                return (
                    (
                        user.name.toLowerCase().includes(searchKey.toLowerCase())) &&
                    searchKey
                ) || (allChats.some(chat => chat.members.map( m => m._id ).includes(user._id)));
            })
            .map(user => {
                return <div className="user-search-filter" 
                            onClick={() => openChat(user._id)} 
                            key={user._id}>
                    <div className={ IsSelectedChat(user) ? "selected-user" : "filtered-user" }>
                        <div className="filter-user-display">
                            {user.profilePic && <img src={user.profilePic} alt="Profile Pic" class="user-profile-image" />}
                            {!user.profilePic && <div className={ IsSelectedChat ? "user-selected-avatar" : "user-default-avatar" }>
                                {
                                    user.name.charAt(0).toUpperCase()
                                }
                            </div>}
                            <div className="filter-user-details">
                                <div className="user-display-name">{ formatName(user) }</div>
                                <div className="user-display-email">{ getLastMessage(user._id) || user.email}</div>
                            </div>
                            <div className="last-message-timestamp">{ getLastMessageTimeStamp(user._id) }</div>
                            {!allChats.find(chat => chat.members.map( m=>m._id ).includes(user._id)) &&
                                <div className="user-start-chat">
                                    <button className="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
                                        Start Chat
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            })
    )
}

export default UsersList;