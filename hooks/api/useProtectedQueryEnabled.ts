import { useAuthStore } from "@/stores/authStore";

export function useProtectedQueryEnabled(enabled = true) {
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return enabled && isAuthInitialized && isAuthenticated;
}
