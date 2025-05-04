import axios from "axios";

const api = axios.create({
    // When using Vite's proxy, baseURL should be relative or empty
    baseURL: "",
    headers: {
        "Content-Type": "application/json",
    },
    // Add this line to enable credentials
    withCredentials: false, // Change to true only if you're using cookies/auth
});

// Add request interceptor to attach the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Ensure headers object exists
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle token expiration
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.error("Authentication error:", error.response.data);
            // Will be handled by refresh logic in AuthContext
        } else if (error.response) {
            console.error("API Error:", error.response.data);
        } else if (error.request) {
            console.error("API Request Error:", error.request);
        } else {
            console.error("API Setup Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
