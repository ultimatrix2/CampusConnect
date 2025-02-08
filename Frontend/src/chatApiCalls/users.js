import axios from "axios";
import { axiosInstance } from "./index";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export const getLoggedUser = async () => {
    try{
        const response = await axiosInstance.get('api/user/get-logged-user');
        console.log("log1",response);
        return response.data.data;
    }catch(error){
        return error;
    }
}
