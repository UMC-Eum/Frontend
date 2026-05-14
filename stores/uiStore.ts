import { create } from "zustand";

type ToastType = "info" | "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
}

interface UiState {
  globalLoadingCount: number;
  toast: ToastState | null;
  showGlobalLoading: () => void;
  hideGlobalLoading: () => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  globalLoadingCount: 0,
  toast: null,
  showGlobalLoading: () =>
    set((state) => ({ globalLoadingCount: state.globalLoadingCount + 1 })),
  hideGlobalLoading: () =>
    set((state) => ({
      globalLoadingCount: Math.max(0, state.globalLoadingCount - 1),
    })),
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
