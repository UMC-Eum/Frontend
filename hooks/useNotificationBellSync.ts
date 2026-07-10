import type { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

import { queryKeys } from "@/hooks/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";

const NOTIFICATION_BELL_SYNC_INTERVAL_MS = 15_000;

export function useNotificationBellSync(queryClient: QueryClient) {
  const notificationEnabled = useNotificationSettingsStore(
    (state) => state.enabled,
  );
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const enabled = notificationEnabled && isAuthInitialized && isAuthenticated;

  useEffect(() => {
    if (!enabled) return;

    const syncNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    };

    syncNotifications();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") syncNotifications();
    });
    const interval = setInterval(
      syncNotifications,
      NOTIFICATION_BELL_SYNC_INTERVAL_MS,
    );

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [enabled, queryClient]);
}
