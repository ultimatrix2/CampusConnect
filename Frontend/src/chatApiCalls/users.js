import axios from "axios";
import { axiosInstance } from "./index";
import { useSelector } from "react-redux";
import { useEffect } from "react";

// const { setAllUsers } = useSelector(state => state.user);

export const getLoggedUser = async () => {
    try{
        const response = await axiosInstance.get('api/user/get-logged-user');
        console.log("log1",response);
        return response.data.data;
    }catch(error){
        return error;
    }
}

// useEffect(() => {
//     const getAllUsers = async () => {
//         try{
//             const response = await axios.get('http://localhost:5001/api/user/get-all-users');
//             console.log(response)
//             // return response.data;
//         }catch(error){
//             return error;
//         }
//     }
//     getAllUsers();
// },[])




// // export const uploadProfilePic = async (image) => {
// //     try{
// //         const response = await axiosInstance.post(url + 'api/user/upload-profile-pic', { image });
// //         return response.data;
// //     }catch(error){
// //         return error;
// //     }
// // }