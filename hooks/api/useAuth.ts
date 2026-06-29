import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTestAccounts,
  kakaoLogin,
  logout,
  testLogin,
} from "@/api/auth/authApi";
import { useAuthStore } from "@/stores/authStore";
import {
  IKakaoLoginRequest,
  ITestLoginRequest,
} from "@/types/api/auth/authDTO";

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
      setAuth(data);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
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
      setAuth(data);
    },
  });
}