import { create } from "zustand";
import axios from "axios";
import { API_URL } from "@/utils/api";
import type { ProfileData, User } from "@/types";
import { getFromLocalStorage } from "@/utils/localstorage";

interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  message?: string;
}

interface UpdateProfileRequest {
  fullName?: string;
  gender?: string;
  bio?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
}

interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; message: string }>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = getFromLocalStorage("token");
      console.log("Token in profile store:", token);
      const res = await axios.get<ProfileResponse>(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (res.data.success && res.data.data) {
        console.log("Profile data received:", res.data.data);
        set({ profile: res.data.data, isLoading: false });
      } else {
        set({ error: res.data.message || "Failed to fetch profile", isLoading: false });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch profile",
        isLoading: false
      });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });

    try {
       const token = getFromLocalStorage("token");
      const res = await axios.put<{ success: boolean; message: string; data?: User }>(
        `${API_URL}/user/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        // Update the profile data if it exists
        const currentProfile = get().profile;
        if (currentProfile && res.data.data) {
          set({
            profile: {
              ...currentProfile,
              user: res.data.data
            },
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
        return { success: true, message: res.data.message || "Profile updated successfully" };
      } else {
        set({ error: res.data.message || "Failed to update profile", isLoading: false });
        return { success: false, message: res.data.message || "Failed to update profile" };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },
}));