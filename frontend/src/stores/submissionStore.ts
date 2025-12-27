import { create } from "zustand";
import axios from "axios";
import type { RunRequest, RunResponse, SubmitRequest } from "@/types/submission.types";
import { API_URL } from "@/utils/api";

interface SubmissionState {
  loading: boolean;
  error: string | null;
  result: RunResponse | null;

  runCode: (payload: RunRequest) => Promise<void>;
  submitCode: (payload: SubmitRequest) => Promise<void>;
  clearResult: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  loading: false,
  error: null,
  result: null,

  runCode: async (payload) => {
    console.log("Run payload is ", payload)
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/submissions/run`, payload);

      set({
        result: res.data.data,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to run code",
      });
    }
  },

  submitCode: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/submissions/submit`, payload);

      set({
        result: res.data.data,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to submit code",
      });
    }
  },

  clearResult: () => {
    set({ result: null, error: null });
  },
}));
