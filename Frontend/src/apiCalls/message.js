import { axiosInstance } from "./index";

export const createNewMessage = async( message ) => {
    try{
        const response = await axiosInstance.post('api/chat/new-message', { message });
        return response.data;
    }
    catch(error){
        return error;
    }
}