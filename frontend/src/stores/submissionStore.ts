import { create } from "zustand";
import axios from "axios";
import type {
  RunRequest,
  RunResponse,
  SubmitRequest,
} from "@/types/submission.types";
import { API_URL } from "@/utils/api";
import { useAuthStore } from "./authStore";

interface SubmissionState {
  loading: boolean;
  error: string | null;

  runResult: RunResponse | null;
  submissionResult: any | null;

  pollTimeoutId: number | null;

  runCode: (payload: RunRequest) => Promise<void>;
  submitCode: (payload: SubmitRequest) => Promise<void>;
  pollSubmission: (submissionId: string) => void;
  cancelPolling: () => void;
  clear: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  loading: false,
  error: null,

  runResult: null,
  submissionResult: null,

  pollTimeoutId: null,

  /* ---------------- RUN CODE ---------------- */
  runCode: async (payload) => {
    try {
      get().cancelPolling(); // 🔥 stop any existing polling
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/submissions/run`, payload);

      set({
        runResult: res.data.data,
        submissionResult: null,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to run code",
      });
    }
  },

  /* ---------------- SUBMIT CODE ---------------- */
  submitCode: async (payload) => {
    try {
      get().cancelPolling(); //important
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/submissions/submit`, payload, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      const { submissionId } = res.data.data;

      set({ loading: false });

      get().pollSubmission(submissionId);
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to submit code",
      });
    }
  },

  /* ---------------- HTTP POLLING ---------------- */
  pollSubmission: (submissionId: string) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    const poll = async () => {
      try {
        const res = await axios.get(`${API_URL}/submissions/${submissionId}`, {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        });

        const submission = res.data.data;
        console.log("Submission resule is ", submission);

        set({ submissionResult: submission });

        if (
          submission.status === "COMPLETED" ||
          submission.status === "FAILED"
        ) {
          set({ pollTimeoutId: null });
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          set({
            error: "Submission timed out",
            pollTimeoutId: null,
          });
          return;
        }

        attempts++;

        const timeoutId = window.setTimeout(poll, 2000);
        set({ pollTimeoutId: timeoutId });
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message || "Failed to fetch submission result",
          pollTimeoutId: null,
        });
      }
    };

    poll();
  },

  /* ---------------- CANCEL POLLING ---------------- */
  cancelPolling: () => {
    const id = get().pollTimeoutId;
    if (id) {
      clearTimeout(id);
    }
    set({ pollTimeoutId: null });
  },

  clear: () => {
    get().cancelPolling();
    set({
      runResult: null,
      submissionResult: null,
      error: null,
    });
  },
}));
