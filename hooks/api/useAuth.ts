import { useMutation, useQueryClient } from "@tanstack/react-query";

import { kakaoLogin, logout } from "@/api/auth/authApi";
import { useAuthStore } from "@/stores/authStore";
import { IKakaoLoginRequest } from "@/types/api/auth/authDTO";

export function useKakaoLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (body: IKakaoLoginRequest) => kakaoLogin(body),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.invalidateQueries();
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
