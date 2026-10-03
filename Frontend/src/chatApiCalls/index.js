import axios from "axios";

// base url for the backend server
const BaseUrl = "http://localhost:5001/";

export const axiosInstance = axios.create({
    baseURL: BaseUrl,
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
});
