import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IKakaoLoginResponse } from "@/types/api/auth/authDTO";
import { safeAsyncStorage } from "@/utils/safeAsyncStorage";

interface AuthState {
  accessToken: string | null;
  user: IKakaoLoginResponse["user"] | null;
  isNewUser: boolean;
  onboardingRequired: boolean;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthState["user"]) => void;
  setAuth: (payload: IKakaoLoginResponse) => void;
  setAuthInitialized: (isAuthInitialized: boolean) => void;
  completeOnboarding: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isNewUser: false,
      onboardingRequired: false,
      isAuthenticated: false,
      isAuthInitialized: false,
      setAccessToken: (accessToken) =>
        set({
          accessToken,
          isAuthenticated: !!accessToken,
        }),
      setUser: (user) => set({ user }),
      setAuth: (payload) =>
        set({
          accessToken: payload.accessToken,
          user: payload.user,
          isNewUser: payload.isNewUser,
          onboardingRequired: payload.onboardingRequired,
          isAuthenticated: true,
          isAuthInitialized: true,
        }),
      setAuthInitialized: (isAuthInitialized) =>
        set({
          isAuthInitialized,
        }),
      completeOnboarding: () =>
        set({
          isNewUser: false,
          onboardingRequired: false,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          user: null,
          isNewUser: false,
          onboardingRequired: false,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-onboarding-flags",
      storage: createJSONStorage(() => safeAsyncStorage),
      // 토큰은 저장하지 않는다(쿠키 refresh로 복원). 앱 재실행 시
      // 온보딩 미완료 상태만 복원하면 된다.
      partialize: (state) => ({
        isNewUser: state.isNewUser,
        onboardingRequired: state.onboardingRequired,
      }),
    },
  ),
);

export const getAuthAccessToken = () => useAuthStore.getState().accessToken;
