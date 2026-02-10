import { useEffect, useRef } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useUserStore } from "../stores/useUserStore";

export const useNotificationPolling = (
  intervalMs: number = 30000,
  enabled: boolean = true, // 🟢 제어용 파라미터 추가 (기본값 true)
) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const refreshNotifications = useNotificationStore(
    (state) => state.refreshNotifications,
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 🟢 로그인 안 했거나, enabled가 false면 폴링 중지
    if (!isLoggedIn || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 1. (옵션) 페이지 진입 시 즉시 1회 실행
    console.log("🚀 [Polling] 시작");
    refreshNotifications();

    // 2. 주기적 실행
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("⏰ [Polling] 주기적 확인 중...");
        refreshNotifications();
      }
    }, intervalMs);

    // 3. 윈도우 포커스 시 즉시 실행
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
  }, [isLoggedIn, refreshNotifications, intervalMs, enabled]); // 🟢 의존성 배열에 enabled 추가
};
