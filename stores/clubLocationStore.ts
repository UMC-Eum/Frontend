import { create } from "zustand";

// 동호회 홈에서 "어느 지역 동호회를 볼지" 고른 값. 프로필 거주지와 별개(조회 전용).
interface ClubLocationState {
  areaCode: string | null;
  areaName: string | null;
  setArea: (areaCode: string, areaName: string) => void;
  clear: () => void;
}

export const useClubLocationStore = create<ClubLocationState>((set) => ({
  areaCode: null,
  areaName: null,
  setArea: (areaCode, areaName) => set({ areaCode, areaName }),
  clear: () => set({ areaCode: null, areaName: null }),
}));
