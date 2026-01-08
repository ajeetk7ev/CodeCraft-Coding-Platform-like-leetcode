import axios from "axios";
import { getFromLocalStorage } from "./localstorage";

export const API_URL = import.meta.env.VITE_API_URL;

// Set up axios interceptor to automatically add auth token
axios.interceptors.request.use(
  (config) => {
    const token = getFromLocalStorage("token");
    if (token && config.url?.startsWith(API_URL)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up axios response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);