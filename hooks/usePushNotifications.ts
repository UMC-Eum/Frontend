import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";
import {
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
    const unsubscribeMessage = messaging().onMessage((remoteMessage) => {
      void presentForegroundMessage(remoteMessage);
    });
    // 백그라운드에서 알림 탭 → 앱 열림
    const unsubscribeOpened = messaging().onNotificationOpenedApp((message) => {
      console.log("[push] 알림 탭:", message.notification);
      // TODO: 알림 payload(data.type 등) 기준 딥링크 라우팅
    });
    // 앱이 완전히 종료된 상태에서 알림으로 실행된 경우
    void messaging()
      .getInitialNotification()
      .then((message) => {
        if (!message) return;
        console.log("[push] 종료상태에서 알림으로 열림:", message.notification);
        // TODO: 딥링크 라우팅
      });

    return () => {
      unsubscribeMessage();
      unsubscribeOpened();
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

    const unsubscribeRefresh = messaging().onTokenRefresh(() => {
      void syncPushTokenToServer();
    });
    return () => unsubscribeRefresh();
  }, [isAuthenticated, notificationEnabled]);
}
