import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
    // Add this line to enable credentials
    withCredentials: false, // Change to true only if you're using cookies/auth
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
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
