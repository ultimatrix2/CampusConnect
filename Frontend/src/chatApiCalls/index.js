import axios from "axios";

// base url for the backend server
const BaseUrl = "http://localhost:5001/";

// shared axios instance with auth token attached
// every api call through this will include the jwt token dynamically
export const axiosInstance = axios.create({
    baseURL: BaseUrl,
});

// dynamic interceptor to ensure the latest token is always sent
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    } else {
        delete config.headers.authorization;
    }
    return config;
});

