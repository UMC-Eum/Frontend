import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeAsyncStorage } from "@/utils/safeAsyncStorage";

interface HeartBadgeState {
  // 마음함에서 마지막으로 확인한 받은 마음의 heartId (앱 재시작 후에도 유지)
  lastSeenHeartId: number;
  // 저장소 복원 전에는 dot 판단을 보류하기 위한 플래그
  hasHydrated: boolean;
  markHeartsSeen: (latestHeartId: number) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useHeartBadgeStore = create<HeartBadgeState>()(
  persist(
    (set) => ({
      lastSeenHeartId: 0,
      hasHydrated: false,
      markHeartsSeen: (latestHeartId) =>
        set((state) => ({
          lastSeenHeartId: Math.max(state.lastSeenHeartId, latestHeartId),
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "heart-badge",
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({ lastSeenHeartId: state.lastSeenHeartId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
