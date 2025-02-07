import axios from 'axios';

const url = "http://localhost:5001";

export const getAllChats = async() => {
    try{
        const response = await axios.get(`${url}/api/chat/get-all-chats`);
        return response.data;
    }
    catch(error){
        return error;
    }
}

export const createNewChat = async(members) => {
    try{
        const response = await axios.post(`${url}/api/chat/create-new-chat`, { members });
        console.log("create chat",response)
        return response.data.data;
    }
    catch(error){
        return error;
    }
}