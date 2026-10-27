import axios from "axios";
import { API_BASE_URL } from "../config";

// base url for the backend server
const BaseUrl = `${API_BASE_URL}/`;

export const axiosInstance = axios.create({
    baseURL: BaseUrl,
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
});
