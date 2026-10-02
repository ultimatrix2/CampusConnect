import axios from "axios";

// base url for the backend server
const BaseUrl = "http://localhost:5001/";

// shared axios instance with auth token attached
// every api call through this will include the jwt token automatically
export const axiosInstance = axios.create({
    baseURL: BaseUrl,
    headers:{
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
});
