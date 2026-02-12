import { useEffect, useRef } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useUserStore } from "../stores/useUserStore";

export const useNotificationPolling = (
  intervalMs: number = 30000,
  enabled: boolean = true,
) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const refreshNotifications = useNotificationStore(
    (state) => state.refreshNotifications,
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    refreshNotifications();

    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    }, intervalMs);

    const handleFocus = () => {
      refreshNotifications();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoggedIn, refreshNotifications, intervalMs, enabled]);
};
