import { create } from "zustand";
import type { Problem } from "@/types/index";
import axios from "axios";
import { API_URL } from "@/utils/api";
import { useAuthStore } from "./authStore";

interface ProblemState {
  problem: Problem | null;
  loading: boolean;
  error: string | null;

  fetchProblemBySlug: (slug: string) => Promise<void>;
  clearProblem: () => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
  problem: null,
  loading: false,
  error: null,

  fetchProblemBySlug: async (slug: string) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get(`${API_URL}/problems/${slug}`,{
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              }});
      if (res.data) {
        set({
          problem: res.data.data,
        });
      }

    } catch (err) {
      let message = "Something went wrong";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message || err.response?.statusText || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({
        error: message,
      });
    } finally {
      set({ loading: false });
    }
  },

  clearProblem: () => {
    set({ problem: null, error: null });
  },
}));
