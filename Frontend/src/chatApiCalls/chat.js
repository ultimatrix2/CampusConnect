import { axiosInstance } from '.';


const url = "http://localhost:5001";

// get all chats for the logged-in user
export const getAllChats = async () => {
    try {
        const response = await axiosInstance.get(`/api/chat/get-all-chats`);
        return response.data;
    }
    catch (error) {
        return error;
    }
}

// create a new chat between two members
export const createNewChat = async (members) => {
    try {
        const response = await axiosInstance.post(`api/chat/create-new-chat`, { members });
        return response.data.data;
    }
    catch (error) {
        return error;
    }
}