import { create } from "zustand";

interface ToastState {
  message: string | null;
  type: "info" | "success" | "error" | "warning";
  isVisible: boolean;
  link: string | null;

  showToast: (
    message: string,
    type?: "info" | "success" | "error" | "warning",
    link?: string | null,
  ) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "info",
  isVisible: false,
  link: null,

  showToast: (message, type = "info", link = null) => {
    set({
      message,
      type,
      isVisible: true,
      link,
    });

    setTimeout(() => {
      set({ isVisible: false });
      setTimeout(() => {
        set({ message: null, link: null });
      }, 300);
    }, 3000);
  },

  hideToast: () => {
    set({ isVisible: false });
  },
}));
