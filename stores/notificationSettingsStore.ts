import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ enabled: state.enabled }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  );
