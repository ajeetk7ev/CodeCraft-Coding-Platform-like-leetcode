import { create } from "zustand";
import axios from "axios";
import { API_URL } from "@/utils/api";
import type { User } from "@/types";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "@/utils/localstorage";

interface AuthResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  authIsLoading: boolean;

  signup: (
    fullName: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>;

  login: (email: string, password: string) => Promise<AuthResponse>;

  loadUser: () => void;
  logout: () => void;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
}

const initialToken = getFromLocalStorage("token");
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getFromLocalStorage("user"),
  token: initialToken,
  authIsLoading: false,

  setUser: (user: User) => {
    setToLocalStorage("user", user);
    set({ user });
  },

  // ================= SIGNUP =================
  signup: async (fullName, username, email, password) => {
    set({ authIsLoading: true });

    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        fullName,
        username,
        email,
        password,
      });

      const { message } = res.data;

      return { success: true, message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
      };
    } finally {
      set({ authIsLoading: false });
    }
  },

  // ================= LOGIN =================
  login: async (email, password) => {
    set({ authIsLoading: true });

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token, message } = res.data;

      setToLocalStorage("user", user);
      setToLocalStorage("token", token);
      set({ user, token });
      // Set axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
      };
    } finally {
      set({ authIsLoading: false });
    }
  },

  // ================= LOAD USER =================
  loadUser: async () => {
    const user = getFromLocalStorage("user");
    const token = getFromLocalStorage("token");

    if (user && token) {
      set({ user, token });
      // Set axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Refetch user data to ensure latest streak/stats
      try {
        const res = await axios.get(`${API_URL}/user/profile`);
        if (res.data.success) {
          const { user: fetchedUser } = res.data.data;
          setToLocalStorage("user", fetchedUser);
          set({ user: fetchedUser });
        }
      } catch (error) {
        console.error("Failed to refetch user in loadUser:", error);
      }
    }
  },

  // ================= LOGOUT =================
  logout: () => {
    removeFromLocalStorage("user");
    removeFromLocalStorage("token");
    // Remove axios default headers
    delete axios.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
  },

  // ================= FETCH USER =================
  fetchUser: async () => {
    try {
      const res = await axios.get(`${API_URL}/user/profile`);
      if (res.data.success) {
        const { user } = res.data.data;
        // The backend returns user inside a data object, let's verify the structure
        // Looking at user.controller.ts: responseData = { success: true, data: { user: userResponse, stats: ... } }

        setToLocalStorage("user", user);
        set({ user });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  },
}));
