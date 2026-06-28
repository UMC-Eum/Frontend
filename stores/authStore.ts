import { create } from "zustand";

import { IKakaoLoginResponse } from "@/types/api/auth/authDTO";

interface AuthState {
  accessToken: string | null;
  user: IKakaoLoginResponse["user"] | null;
  isNewUser: boolean;
  onboardingRequired: boolean;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setAuth: (payload: IKakaoLoginResponse) => void;
  completeOnboarding: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isNewUser: false,
  onboardingRequired: false,
  isAuthenticated: false,
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: !!accessToken,
    }),
  setAuth: (payload) =>
    set({
      accessToken: payload.accessToken,
      user: payload.user,
      isNewUser: payload.isNewUser,
      onboardingRequired: payload.onboardingRequired,
      isAuthenticated: true,
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
}));

export const getAuthAccessToken = () => useAuthStore.getState().accessToken;
