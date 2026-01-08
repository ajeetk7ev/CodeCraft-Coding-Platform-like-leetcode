// src/store/dashboardCollapsedStore.ts
import { create } from "zustand";

interface DashboardCollapsedState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

export const useDashboardCollapsedStore = create<DashboardCollapsedState>(
  (set) => ({
    collapsed: false,
    toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    setCollapsed: (v) => set({ collapsed: v }),
  })
);
