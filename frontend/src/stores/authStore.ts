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
    password: string
  ) => Promise<AuthResponse>;

  login: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;

  loadUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getFromLocalStorage("user"),
  token: getFromLocalStorage("token"),
  authIsLoading: false,

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

      const { user, token, message } = res.data;

      setToLocalStorage("user", user);
      setToLocalStorage("token", token);
      set({ user, token });

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
  loadUser: () => {
    const user = getFromLocalStorage("user");
    const token = getFromLocalStorage("token");

    if (user && token) {
      set({ user, token });
    }
  },

  // ================= LOGOUT =================
  logout: () => {
    removeFromLocalStorage("user");
    removeFromLocalStorage("token");
    set({ user: null, token: null });
  },
}));
