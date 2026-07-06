import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeAsyncStorage } from "@/utils/safeAsyncStorage";

interface NotificationSettingsState {
  enabled: boolean;
  hasHydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useNotificationSettingsStore =
  create<NotificationSettingsState>()(
    persist(
      (set) => ({
        enabled: true,
        hasHydrated: false,
        setEnabled: (enabled) => set({ enabled }),
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      }),
      {
        name: "notification-settings",
        storage: createJSONStorage(() => safeAsyncStorage),
        partialize: (state) => ({ enabled: state.enabled }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  );
