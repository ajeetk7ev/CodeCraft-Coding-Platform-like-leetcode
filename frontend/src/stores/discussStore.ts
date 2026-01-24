import { create } from "zustand";
import axios from "axios";
import { API_URL } from "@/utils/api";
import type { IDiscussion, IComment } from "../types/discussion";
import { getFromLocalStorage } from "@/utils/localstorage";

interface DiscussState {
  discussions: IDiscussion[];
  currentDiscussion: IDiscussion | null;
  comments: IComment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDiscussions: (params?: any) => Promise<void>;
  fetchDiscussionById: (id: string) => Promise<void>;
  createDiscussion: (data: Partial<IDiscussion>) => Promise<any>;
  updateDiscussion: (id: string, data: Partial<IDiscussion>) => Promise<any>;
  deleteDiscussion: (id: string) => Promise<void>;
  fetchComments: (
    discussionId: string,
    parentCommentId?: string | null,
  ) => Promise<void>;
  addComment: (
    discussionId: string,
    data: { content: string; parentCommentId?: string },
  ) => Promise<any>;
  toggleVote: (
    targetId: string,
    data: { targetType: "Discussion" | "Comment"; voteType: 1 | -1 },
  ) => Promise<void>;
}

const BASE_URL = `${API_URL}/discussions`;

const getAuthHeaders = () => {
  const token = getFromLocalStorage("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useDiscussStore = create<DiscussState>((set, get) => ({
  discussions: [],
  currentDiscussion: null,
  comments: [],
  isLoading: false,
  error: null,

  fetchDiscussions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(BASE_URL, {
        params,
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ discussions: response.data.data });
      } else {
        set({ error: response.data.message });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch discussions",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDiscussionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ currentDiscussion: response.data.data });
      } else {
        set({ error: response.data.message });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch discussion",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createDiscussion: async (data: Partial<IDiscussion>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(BASE_URL, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create discussion",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDiscussion: async (id: string, data: Partial<IDiscussion>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${BASE_URL}/${id}`, data, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ currentDiscussion: response.data.data });
      }
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update discussion",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDiscussion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ discussions: get().discussions.filter((d) => d._id !== id) });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete discussion",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComments: async (discussionId: string, parentCommentId = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/${discussionId}/comments`, {
        params: { parentCommentId: parentCommentId || "null" },
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        set({ comments: response.data.data });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch comments",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (
    discussionId: string,
    data: { content: string; parentCommentId?: string },
  ) => {
    set({ error: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/${discussionId}/comments`,
        data,
        {
          headers: getAuthHeaders(),
        },
      );
      if (response.data.success) {
        const fetchCommentsAction = get().fetchComments;
        await fetchCommentsAction(discussionId);
      }
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to add comment" });
      throw error;
    }
  },

  toggleVote: async (
    targetId: string,
    data: { targetType: "Discussion" | "Comment"; voteType: 1 | -1 },
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/${targetId}/vote`, data, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        // Refresh based on target type
        if (data.targetType === "Discussion") {
          const discId = get().currentDiscussion?._id;
          if (discId) await get().fetchDiscussionById(discId);
        } else {
          const discId = get().currentDiscussion?._id;
          if (discId) await get().fetchComments(discId);
        }
      }
    } catch (error: any) {
      console.error("Failed to vote:", error);
    }
  },
}));
