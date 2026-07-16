import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  appleLogin,
  getTestAccounts,
  kakaoLogin,
  logout,
  testLogin,
} from "@/api/auth/authApi";
import { disconnectChatSocket } from "@/api/chats/chatSocketApi";
import { useAuthStore } from "@/stores/authStore";
import {
  IAppleLoginRequest,
  IKakaoLoginRequest,
  ITestLoginRequest,
} from "@/types/api/auth/authDTO";
import { removePushTokenFromServer } from "@/utils/pushNotifications";

import { queryKeys } from "./queryKeys";

export function useKakaoLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (body: IKakaoLoginRequest) => kakaoLogin(body),
    onSuccess: (data) => {
      if (__DEV__) {
        console.log("[ACCESS_TOKEN][LOGIN]", data.accessToken);
      }

      queryClient.removeQueries();
      setAuth(data, "KAKAO");
    },
  });
}

export function useAppleLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (body: IAppleLoginRequest) => appleLogin(body),
    onSuccess: (data) => {
      if (__DEV__) {
        console.log("[ACCESS_TOKEN][APPLE_LOGIN]", data.accessToken);
      }

      queryClient.removeQueries();
      setAuth(data, "APPLE");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    // 인증이 남아있을 때 푸시 토큰 먼저 해제한 뒤 로그아웃
    mutationFn: async () => {
      await removePushTokenFromServer();
      return logout();
    },
    onSettled: () => {
      disconnectChatSocket();
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useTestAccountsQuery(enabled = false) {
  return useQuery({
    queryKey: queryKeys.auth.testAccounts(),
    queryFn: getTestAccounts,
    enabled,
  });
}

export function useTestLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (body: ITestLoginRequest = {}) => testLogin(body),
    onSuccess: (data) => {
      if (__DEV__) {
        console.log("[ACCESS_TOKEN][TEST_LOGIN]", data.accessToken);
      }

      queryClient.removeQueries();
      setAuth(data, "LOCAL");
    },
  });
}
