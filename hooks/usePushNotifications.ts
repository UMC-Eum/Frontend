import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";
import {
  getInitialPushNotification,
  onForegroundMessage,
  onNotificationOpened,
  onPushTokenRefresh,
  openPushNotification,
  presentForegroundMessage,
  removePushTokenFromServer,
  syncPushTokenToServer,
} from "@/utils/pushNotifications";

// 수신/탭 리스너를 붙이고, 로그인 + 알림 ON 상태에서 FCM 토큰을 서버에 등록한다.
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const notificationEnabled = useNotificationSettingsStore(
    (state) => state.enabled,
  );

  useEffect(() => {
    // 포그라운드 수신 → 로컬 알림으로 표시
    const unsubscribeMessage = onForegroundMessage((remoteMessage) => {
      void presentForegroundMessage(remoteMessage);
    });
    // 백그라운드에서 알림 탭 → 앱 열림 → payload 기준 라우팅
    const unsubscribeOpened = onNotificationOpened((message) => {
      openPushNotification(message.data);
    });
    // 앱이 완전히 종료된 상태에서 알림으로 실행된 경우
    void getInitialPushNotification().then((message) => {
      if (!message) return;
      // ponytail: 인증 초기화·초기 Redirect가 끝난 뒤 이동하도록 지연으로 회피 —
      // 콜드스타트에서 목적지 유실이 재발하면 pending-link 저장 방식으로 승격
      setTimeout(() => openPushNotification(message.data), 1500);
    });
    // 포그라운드에서 로컬 알림으로 표시한 것을 탭한 경우
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        openPushNotification(
          response.notification.request.content.data as Record<string, unknown>,
        );
      });

    return () => {
      unsubscribeMessage?.();
      unsubscribeOpened?.();
      responseSubscription.remove();
    };
  }, []);

  // 로그인 + 알림받기 ON → 등록/갱신, 알림받기 OFF(인증 상태) → 해제
  useEffect(() => {
    if (!isAuthenticated) return;

    if (notificationEnabled) {
      void syncPushTokenToServer();
    } else {
      void removePushTokenFromServer();
    }
  }, [isAuthenticated, notificationEnabled]);

  // 토큰이 갱신되면(로그인·알림 ON일 때만) 서버에 반영
  useEffect(() => {
    if (!isAuthenticated || !notificationEnabled) return;

    const unsubscribeRefresh = onPushTokenRefresh(() => {
      void syncPushTokenToServer();
    });
    return () => unsubscribeRefresh?.();
  }, [isAuthenticated, notificationEnabled]);
}
