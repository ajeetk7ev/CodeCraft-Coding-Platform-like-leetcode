import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or however you store it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      "Protocol transmission failure detected.";

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Potentially trigger a logout or redirect to login
      console.warn("Unauthorized access - Session may be invalid or expired.");
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    // Show toast for all operational errors except those we might want to handle silently
    if (error.response?.status !== 404 && !error.config?.hideToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
