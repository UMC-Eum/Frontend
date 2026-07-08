import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import { PermissionsAndroid, Platform } from "react-native";

import {
  registerPushToken,
  unregisterPushToken,
} from "@/api/notifications/notificationsApi";

type MessagingFactory = typeof import("@react-native-firebase/messaging").default;
type MessagingModule = { default?: MessagingFactory } & MessagingFactory;
type Unsubscribe = () => void;

let cachedMessaging: MessagingFactory | null | undefined;

function getMessaging(): MessagingFactory | null {
  if (cachedMessaging !== undefined) return cachedMessaging;

  try {
    const module = require("@react-native-firebase/messaging") as MessagingModule;
    cachedMessaging = module.default ?? module;
  } catch {
    cachedMessaging = null;
  }

  return cachedMessaging;
}

// 포그라운드에서도 알림 배너/목록/소리를 표시한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 백그라운드 데이터 메시지 핸들러는 앱 로드 시점(컴포넌트 밖)에 등록해야 한다.
// ponytail: 네이티브 Firebase 없는 환경(Expo Go 등)에서는 throw → 무시
try {
  getMessaging()?.().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("[push] 백그라운드 메시지:", remoteMessage.messageId);
  });
} catch {
  // no-op
}

export type DeviceInfo = { deviceId: string; appVersion: string };

// push-tokens 등록에 필요한 디바이스 식별자/앱 버전.
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const appVersion = Application.nativeApplicationVersion ?? "1.0.0";
  const deviceId =
    Platform.OS === "ios"
      ? ((await Application.getIosIdForVendorAsync()) ?? "unknown-ios")
      : (Application.getAndroidId() ?? "unknown-android");
  return { deviceId, appVersion };
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android" || Number(Platform.Version) < 33) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// 권한 요청 + (Android)채널 설정 후 FCM 등록 토큰을 반환한다. 실패/거부 시 null.
// ponytail: 실기기 development build에서만 동작 — Expo Go/시뮬레이터는 토큰 못 받음
export async function getFcmToken(): Promise<string | null> {
  const messaging = getMessaging();
  if (!messaging) return null;

  if (Platform.OS === "android") {
    // Android는 채널이 없으면 알림이 아예 안 뜬다.
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let granted = await requestAndroidNotificationPermission();
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }
  if (!granted) {
    console.log("[push] 알림 권한 거부됨");
    return null;
  }

  try {
    const token = await messaging().getToken();
    console.log("[push] FCM token =", token);
    return token;
  } catch (error) {
    console.log("[push] FCM 토큰 획득 실패:", error);
    return null;
  }
}

export function onForegroundMessage(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): Unsubscribe | null {
  return getMessaging()?.().onMessage(handler) ?? null;
}

export function onNotificationOpened(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): Unsubscribe | null {
  return getMessaging()?.().onNotificationOpenedApp(handler) ?? null;
}

export async function getInitialPushNotification(): Promise<
  FirebaseMessagingTypes.RemoteMessage | null
> {
  return (await getMessaging()?.().getInitialNotification()) ?? null;
}

export function onPushTokenRefresh(handler: () => void): Unsubscribe | null {
  return getMessaging()?.().onTokenRefresh(handler) ?? null;
}

// iOS는 앱이 포그라운드일 때 FCM 알림을 자동으로 안 띄운다 → 로컬 알림으로 표시.
export async function presentForegroundMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const notification = message.notification;
  if (!notification) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title ?? "",
      body: notification.body ?? "",
      data: message.data ?? {},
    },
    trigger: null,
  });
}

// 로그인/알림 ON/토큰 갱신 시: 현재 FCM 토큰을 서버에 등록·갱신한다.
export async function syncPushTokenToServer(): Promise<void> {
  const token = await getFcmToken();
  if (!token) return;

  const { deviceId, appVersion } = await getDeviceInfo();
  const platform = Platform.OS === "ios" ? "IOS" : "ANDROID";
  try {
    await registerPushToken({ token, platform, deviceId, appVersion });
  } catch (error) {
    console.log("[push] 토큰 서버 등록 실패:", error);
  }
}

// 알림 OFF/로그아웃/탈퇴 시: 현재 디바이스 토큰을 서버에서 해제한다.
// 인증이 남아있을 때(clearAuth 이전) 호출해야 한다.
export async function removePushTokenFromServer(): Promise<void> {
  const messaging = getMessaging();
  if (!messaging) return;

  try {
    const token = await messaging().getToken();
    await unregisterPushToken(token);
  } catch (error) {
    console.log("[push] 토큰 서버 해제 실패:", error);
  }
}
