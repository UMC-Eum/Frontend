import { useEffect, useRef } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useUserStore } from "../stores/useUserStore";

export const useNotificationPolling = (intervalMs: number = 30000) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const refreshNotifications = useNotificationStore(
    (state) => state.refreshNotifications,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      // 로그인하지 않았으면 타이머 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 즉시 한 번 실행
    console.log("🔔 알림 폴링 시작!");
    refreshNotifications();

    // 그 다음부터 주기적으로 실행
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("🔔 알림 폴링 중...");
        refreshNotifications();
      }
    }, intervalMs);

    const handleFocus = () => {
      console.log("🔔 포커스되어 알림 폴링!");
      refreshNotifications();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoggedIn, refreshNotifications, intervalMs]);
};
