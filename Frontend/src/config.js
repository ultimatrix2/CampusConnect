// Centralized API configuration for local development and cloud deployment
const rawUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export default API_BASE_URL;
